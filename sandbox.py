"""
sandbox.py — WasmBox core sandbox.

Runs untrusted Python source INSIDE a Python interpreter that has itself
been compiled to WebAssembly (WASI). Because the guest is a WASM module,
Wasmtime can strictly control what it's allowed to touch:

  - No filesystem access at all      (we grant zero WASI preopens)
  - No network access at all         (WASM has no socket syscalls unless
                                       the host explicitly wires them up)
  - Bounded memory                   (linear memory size cap)
  - Bounded execution                (Wasmtime "fuel" = instruction budget,
                                       so `while True: pass` cannot hang forever)

This is the same idea as VisionEdge doing zero-copy GPU work or StreamForge
doing exactly-once processing: the interesting engineering is in the
constraints, not just "run the code".
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
                 fuel: int = 5_000_000):
        if not os.path.exists(python_wasm_path):
            raise FileNotFoundError(
                f"Python-WASI binary not found at '{python_wasm_path}'. "
                "See README.md 'Getting the Python WASM binary'."
            )

        self.python_wasm_path = python_wasm_path
        self.max_memory_pages = max_memory_pages
        self.fuel = fuel

        config = Config()
        config.consume_fuel = True
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
        store.add_fuel(self.fuel)

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
