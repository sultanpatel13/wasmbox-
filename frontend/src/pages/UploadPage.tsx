import { FileCode2 } from "lucide-react";
import { UploadDropzone } from "../components/UploadDropzone";
import { useRuntimeData } from "../hooks/useRuntimeData";
import { formatBytes, formatDate } from "../utils/format";

export function UploadPage() {
  const { loading, modules } = useRuntimeData();

  return (
    <main className="page">
      <header className="page-header">
        <h1>Module Upload</h1>
        <p>Validate and stage WebAssembly modules before execution.</p>
      </header>

      <UploadDropzone loading={loading} />

      <section className="panel">
        <div className="panel-header">
          <h2>Uploaded Modules</h2>
        </div>
        <div className="table">
          {modules.length === 0 ? (
            <div className="empty-state">
              <FileCode2 size={48} />
              <p>No modules uploaded yet</p>
            </div>
          ) : (
            modules.map((module) => (
              <div className="table-row" key={module.id}>
                <FileCode2 size={18} />
                <span>{module.name}</span>
                <span>{formatBytes(module.size)}</span>
                <span>{formatDate(module.uploadedAt)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}