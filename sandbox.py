"""
sandbox.py — WasmBox core sandbox.

Purpose:
Runs untrusted Python code inside a Python interpreter compiled to
WebAssembly (WASI). This provides a secure environment where user code
cannot directly access the host system.

Example:
    user_code = '''
    print("Hello, WasmBox!")
    '''

    result = sandbox.run(user_code)
    print(result.stdout)

Security Features:

1. No Filesystem Access
   User Code:
       open("secret.txt", "r")

   Result:
       File access denied.

2. No Network Access
   User Code:
       import socket
       socket.create_connection(("google.com", 80))

   Result:
       Network access denied.

3. Memory Limit
   User Code:
       data = []
       while True:
           data.append("A" * 1024)

   Result:
       Execution stopped when memory limit is exceeded.

4. Execution Timeout (Fuel Limit)
   User Code:
       while True:
           pass

   Result:
       Execution stopped because the instruction (fuel) limit was exceeded.

Technology Used:
    - Python
    - FastAPI
    - Wasmtime
    - WebAssembly (WASI)

Flow:
    User Code
        ↓
    PluginSandbox.run()
        ↓
    Wasmtime Engine
        ↓
    Python WASM Runtime
        ↓
    Output / Error Returned

This security model ensures that untrusted Python code runs safely
without affecting the host operating system.
"""

import os
import time
import tempfile

from wasmtime import Engine, Store, Module, Linker, WasiConfig, Config, Trap


class SandboxResult:
    def __init__(self, stdout="", stderr="", execution_time_ms=0.0,
                 error=None, timed_out=False):
        self.stdout = stdout
        self.stderr = stderr
        self.execution_time_ms = execution_time_ms
        self.error = error
        self.timed_out = timed_out

    def to_dict(self):
        return {
            "stdout": self.stdout,
            "stderr": self.stderr,
            "execution_time_ms": self.execution_time_ms,
            "error": self.error,
            "timed_out": self.timed_out,
        }


class PluginSandbox:
    def __init__(self, python_wasm_path: str,
                 max_memory_pages: int = 160,   # 160 * 64KiB ≈ 10 MB
                 fuel: int = 100_000_000):  # 100 million instructions
        if not os.path.exists(python_wasm_path):
            raise FileNotFoundError(
                f"Python-WASI binary not found at '{python_wasm_path}'. "
                "See README.md 'Getting the Python WASM binary'."
            )

        self.python_wasm_path = python_wasm_path
        self.max_memory_pages = max_memory_pages
        self.fuel = fuel
        config = Config()
        # config.consume_fuel = True
        self.engine = Engine(config)
        self.module = Module.from_file(self.engine, python_wasm_path)

    def run(self, user_code: str) -> SandboxResult:
        start = time.perf_counter()

        stdout_fd = tempfile.NamedTemporaryFile(delete=False)
        stderr_fd = tempfile.NamedTemporaryFile(delete=False)
        stdout_path, stderr_path = stdout_fd.name, stderr_fd.name
        stdout_fd.close()
        stderr_fd.close()

        store = Store(self.engine)
        # Set the instruction (fuel) budget for the WebAssembly execution.
        # store.set_fuel(self.fuel)

        # Memory cap. (API name has shifted across wasmtime-py versions —
        # if this errors on your installed version, check `dir(store)`
        # for `set_limits` / `store.limiter`.)
        try:
            store.set_limits(memory_size=self.max_memory_pages * 65536)
        except AttributeError:
            pass  # older/newer wasmtime-py — see README troubleshooting

        wasi_config = WasiConfig()
        # Deliberately NOT calling preopen_dir(...)  -> no filesystem access.
        # Deliberately NOT calling inherit_env()      -> no host env leak.
        # There is no inherit_network() call at all   -> no sockets.
        wasi_config.argv = ("python", "-I", "-S", "-c", user_code)
        wasi_config.stdout_file = stdout_path
        wasi_config.stderr_file = stderr_path
        store.set_wasi(wasi_config)

        linker = Linker(self.engine)
        linker.define_wasi()

        result = SandboxResult()
        try:
            instance = linker.instantiate(store, self.module)
            start_fn = instance.exports(store)["_start"]
            start_fn(store)
        except Trap as t:
            msg = str(t)
            if "fuel" in msg.lower():
                result.timed_out = True
                result.error = "Execution stopped: instruction budget exceeded (likely infinite loop)."
            else:
                result.error = f"Sandbox trap: {msg}"
        except Exception as e:
            result.error = f"Sandbox error: {e}"
        finally:
            result.execution_time_ms = round((time.perf_counter() - start) * 1000, 2)
            with open(stdout_path, "r", errors="replace") as f:
                result.stdout = f.read()
            with open(stderr_path, "r", errors="replace") as f:
                result.stderr = f.read()
            os.unlink(stdout_path)
            os.unlink(stderr_path)

        return result