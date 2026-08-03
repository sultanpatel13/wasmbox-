"""
test_sandbox.py — run this directly to sanity-check the sandbox
without needing FastAPI or a browser at all.

Usage:
    export PYTHON_WASM_PATH=/path/to/python_wasi.wasm
    python test_sandbox.py
"""

import os
from sandbox import PluginSandbox

WASM_PATH = os.environ.get("PYTHON_WASM_PATH", "./python_wasi.wasm")

TESTS = {
    "hello world": 'print("hello from inside the sandbox")',
    "infinite loop (should time out, not hang)": "while True:\n    pass",
    "filesystem attack (should fail)": (
        'try:\n'
        '    open("/etc/passwd").read()\n'
        '    print("!!! FS ACCESS SUCCEEDED - SANDBOX BROKEN")\n'
        'except Exception as e:\n'
        '    print("blocked as expected:", e)'
    ),
    "network attack (should fail)": (
        'import socket\n'
        'try:\n'
        '    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n'
        '    s.connect(("8.8.8.8", 80))\n'
        '    print("!!! NETWORK ACCESS SUCCEEDED - SANDBOX BROKEN")\n'
        'except Exception as e:\n'
        '    print("blocked as expected:", e)'
    ),
}

if __name__ == "__main__":
    sandbox = PluginSandbox(python_wasm_path=WASM_PATH)
    for name, code in TESTS.items():
        print(f"\n=== {name} ===")
        result = sandbox.run(code)
        print("stdout:", result.stdout.strip())
        if result.stderr:
            print("stderr:", result.stderr.strip())
        if result.error:
            print("error:", result.error)
        print(f"time: {result.execution_time_ms}ms  timed_out: {result.timed_out}")