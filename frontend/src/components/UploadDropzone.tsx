import { Upload } from "lucide-react";
import { useRef } from "react";
import { runtimeActions } from "../store/runtimeStore";

export function UploadDropzone({ loading }: { loading: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void runtimeActions.upload(file);
  }

  return (
    <section
      className="panel upload-zone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
    >
      <Upload size={28} />
      <h2>Upload WASM Module</h2>
      <p>Drop a `.wasm` file here or choose one from your machine.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".wasm,application/wasm"
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button className="icon-button primary" onClick={() => inputRef.current?.click()} disabled={loading}>
        <Upload size={18} />
        <span>{loading ? "Uploading" : "Choose File"}</span>
      </button>
    </section>
  );
}
