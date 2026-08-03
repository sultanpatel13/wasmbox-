import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sandbox import PluginSandbox

PYTHON_WASM_PATH = os.environ.get("PYTHON_WASM_PATH", "./python_wasi.wasm")

app = FastAPI(title="WasmBox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sandbox = None
sandbox_error = None
try:
    sandbox = PluginSandbox(python_wasm_path=PYTHON_WASM_PATH)
except Exception as e:
    sandbox_error = str(e)


class RunRequest(BaseModel):
    code: str


@app.get("/health")
def health():
    return {
        "status": "ok" if sandbox else "missing_wasm_binary",
        "python_wasm_path": PYTHON_WASM_PATH,
        "error": sandbox_error,
    }


@app.post("/run")
def run_plugin(req: RunRequest):
    if sandbox is None:
        return {
            "stdout": "",
            "stderr": "",
            "execution_time_ms": 0,
            "timed_out": False,
            "error": f"Sandbox not initialized: {sandbox_error}",
        }
    result = sandbox.run(req.code)
    return result.to_dict()