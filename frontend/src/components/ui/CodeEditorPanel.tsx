import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RunResult {
  stdout: string;
  stderr: string;
  execution_time_ms: number;
  timed_out: boolean;
  error: string | null;
}

const DEFAULT_CODE = `print("Hello, WasmBox!")

for i in range(3):
    print(f"Line {i}")
`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function CodeEditorPanel() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      // Calls the real backend endpoint directly: POST /run { code }
      // (Note: this is separate from the /api/executions flow elsewhere in
      // the app, which expects a different backend contract that isn't
      // implemented yet.)
      const response = await fetch(`${API_BASE_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data: RunResult = await response.json();
      setResult(data);

      if (data.error) {
        toast.error(data.error);
      } else if (data.timed_out) {
        toast.warning("Execution timed out");
      } else {
        toast.success(`Ran in ${data.execution_time_ms}ms`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach backend";
      toast.error(message);
      setResult({ stdout: "", stderr: "", execution_time_ms: 0, timed_out: false, error: message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="panel code-editor-panel">
      <div className="panel-header">
        <div>
          <h2>Plugin Editor</h2>
          <p>Write Python code and execute it inside the WASM sandbox.</p>
        </div>
        <button className="icon-button primary" onClick={handleRun} disabled={running}>
          {running ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
          <span>{running ? "Running..." : "Run"}</span>
        </button>
      </div>

      <div className="monaco-wrapper">
        <Editor
          height="260px"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>

      {result && (
        <div className="code-result">
          {result.error ? (
            <div className="code-result-error">{result.error}</div>
          ) : (
            <>
              <div className="code-result-meta">
                <span>{result.execution_time_ms}ms</span>
                {result.timed_out && <span className="badge warning">Timed out</span>}
              </div>
              {result.stdout && <pre className="code-result-stdout">{result.stdout}</pre>}
              {result.stderr && <pre className="code-result-stderr">{result.stderr}</pre>}
              {!result.stdout && !result.stderr && (
                <div className="code-result-empty">No output</div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
