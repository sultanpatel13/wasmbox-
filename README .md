# WasmBox — Backend

Runs untrusted, user-submitted Python code inside a WebAssembly (WASI)
sandbox instead of a Docker container. No filesystem access, no network
access, memory-capped, and execution is terminated automatically if it
runs too long (via Wasmtime's instruction "fuel" limit).

## Project structure

```
backend/
  main.py              FastAPI app — exposes POST /run and GET /health
  sandbox.py            Core sandbox: wraps wasmtime-py (the important file)
  stub_sandbox.py        Fake sandbox for testing the API without wasmtime
  test_sandbox.py        Standalone test script — no FastAPI needed
  python_wasi.wasm       Python interpreter compiled to WASI (you provide this)
  requirements.txt
```

## Setup

**1. Create and activate a virtual environment**

```bash
cd backend
python -m venv venv
```

Windows:
```bash
venv\Scripts\activate
```
Mac/Linux:
```bash
source venv/bin/activate
```

Your terminal prompt should now start with `(venv)`. If it doesn't, the
activation didn't work — don't proceed until you see it, otherwise
`pip install` and `python` may not agree on which Python they're using.

**2. Install dependencies**

```bash
pip install -r requirements.txt
```

**3. Confirm the Python-WASI binary is present**

You need one file: `python_wasi.wasm`, a Python interpreter compiled for
`wasm32-wasi`. If you don't have it yet:

- Go to the releases page of `vmware-labs/webassembly-language-runtimes`
  on GitHub, find a tag starting with `python/`, and download the
  `python-X.X.X.wasm` asset (not the `-wasmedge.wasm` variant — that's
  for a different runtime).
- Rename it to `python_wasi.wasm` and place it in this folder, or set
  the `PYTHON_WASM_PATH` environment variable to point at wherever you
  put it.

## Running the backend

```bash
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/health` — it should return:
```json
{"status": "ok", "python_wasm_path": "./python_wasi.wasm", "error": null}
```

If `status` says `missing_wasm_binary` instead, the `.wasm` file isn't
where `main.py` expects it — check the `error` field for the exact path
it tried.

You can also test interactively at `http://localhost:8000/docs` — FastAPI
auto-generates a page where you can send test requests without needing
a frontend or `curl`.

## Testing the sandbox directly (no server needed)

Before trusting the API, test the sandbox logic on its own:

```bash
python test_sandbox.py
```

This runs 4 cases and prints the result of each:

| Test | Expected result |
|---|---|
| Hello world | Prints normally, fast |
| Infinite loop (`while True: pass`) | `timed_out: True`, finishes quickly — does **not** hang your terminal |
| Filesystem attack (`open("/etc/passwd")`) | Fails, prints "blocked as expected" |
| Network attack (socket connect) | Fails, prints "blocked as expected" |

**If the infinite loop test hangs instead of terminating, stop and fix
that before doing anything else** — it means fuel metering isn't active,
which is the core safety guarantee of the whole project. Check that in
`sandbox.py`, both of these are active (not commented out):
```python
config.consume_fuel = True
...
store.add_fuel(self.fuel)
```

## API reference

### `GET /health`
Returns whether the sandbox initialized successfully.
```json
{"status": "ok", "python_wasm_path": "./python_wasi.wasm", "error": null}
```

### `POST /run`
Request:
```json
{"code": "print('hello')"}
```
Response:
```json
{
  "stdout": "hello\n",
  "stderr": "",
  "execution_time_ms": 4.2,
  "error": null,
  "timed_out": false
}
```
If the code hits the fuel limit, `timed_out` is `true` and `error`
explains why. If it hits any other error (bad syntax, blocked
filesystem/network access, etc.), `error` contains the message and
`stdout`/`stderr` contain whatever the sandbox captured before it
failed.

## Security model

| Attack surface | How it's blocked |
|---|---|
| Read/write host files | No `preopen_dir()` call — the sandbox has no directories mapped in at all |
| Network sockets | WASM has no socket syscalls; nothing wires them up |
| Host environment variables | `inherit_env()` is never called |
| Infinite loops / CPU exhaustion | Wasmtime "fuel" — a hard instruction budget consumed as the guest runs; execution traps when it runs out |
| Memory bombs | `store.set_limits(memory_size=...)` caps linear memory (~10MB by default) |

## Troubleshooting

**`ModuleNotFoundError: No module named 'wasmtime'` even after installing**
You likely installed into a different Python than the one running your
script (common on Windows with multiple Python installs). Confirm with
`where python` (Windows) or `which python` (Mac/Linux) — make sure it
points inside your `venv` folder. If it doesn't, your virtual
environment isn't actually activated.

**`AttributeError` on `store.set_limits` or `store.add_fuel`**
The `wasmtime-py` API has shifted slightly across versions. Run
`python -c "from wasmtime import Store; print(dir(Store))"` and check
what's actually available on your installed version.

**Infinite loop test hangs instead of returning `timed_out: True`**
See the fuel-metering check above — this is almost always
`config.consume_fuel = True` or `store.add_fuel(...)` being missing or
commented out in `sandbox.py`.

**`/health` shows `missing_wasm_binary`**
Check the exact path in the `error` field of the response — either
move `python_wasi.wasm` there, or set `PYTHON_WASM_PATH` to its actual
location before starting the server.

## Notes on `stub_sandbox.py`

This is a fake version of `PluginSandbox` used only for early development
— it lets you build and test `main.py` before the real sandbox or the
`.wasm` binary is ready, by returning plausible fake responses. It should
not be imported in the final version of `main.py`; confirm your import
line reads:
```python
from sandbox import PluginSandbox
```
not
```python
from stub_sandbox import PluginSandbox
```
