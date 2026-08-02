"""
stub_sandbox.py — FAKE sandbox for Person B to build against on Day 1
morning while Person A builds the real one.

Same class name and method signature as the real sandbox.py, so once
Person A hands off the real file, swap the import in main.py:

    from stub_sandbox import PluginSandbox      # delete this
    from sandbox import PluginSandbox           # add this

...and nothing else in main.py should need to change.
"""
import time
import random


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
    def __init__(self, python_wasm_path: str = "", **kwargs):
        pass  # stub takes no real binary

    def run(self, user_code: str) -> SandboxResult:
        time.sleep(0.1)  # pretend some work happened

        if "while True" in user_code:
            return SandboxResult(
                error="Execution stopped: instruction budget exceeded (likely infinite loop).",
                timed_out=True,
                execution_time_ms=random.randint(400, 900),
            )
        if "/etc/passwd" in user_code or "open(" in user_code:
            return SandboxResult(
                stdout="blocked as expected: [Errno 44] No such file or directory: '/etc/passwd'\n",
                execution_time_ms=random.randint(5, 20),
            )
        if "socket" in user_code:
            return SandboxResult(
                stdout="blocked as expected: [Errno 52] Network unreachable\n",
                execution_time_ms=random.randint(5, 20),
            )
        return SandboxResult(
            stdout="(stub) pretend output for:\n" + user_code[:200],
            execution_time_ms=random.randint(3, 15),
        )
