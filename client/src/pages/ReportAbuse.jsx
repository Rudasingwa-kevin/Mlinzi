import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadScreenshot } from "../services/api";

export default function ReportAbuse() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Please upload an image file (jpg, png, gif, webp)");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }
    setFile(selected);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please select a screenshot first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await uploadScreenshot(file);
      navigate("/results", { state: { report: result.report } });
    } catch (err) {
      const msg = err.response?.data?.error || "Upload failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Report Online Abuse</h1>
      <p className="text-slate-600 mb-8">
        Upload a screenshot of any harmful message you received. Our AI will analyze
        it and provide immediate safety guidance.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : preview
              ? "border-green-300 bg-green-50"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {preview ? (
            <div>
              <img
                src={preview}
                alt="Screenshot preview"
                className="max-h-64 mx-auto rounded-lg shadow-sm mb-3"
              />
              <p className="text-sm text-green-700 font-medium">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                Click or drop to replace
              </p>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-3">📸</div>
              <p className="font-semibold text-slate-700 mb-1">
                Drop your screenshot here
              </p>
              <p className="text-sm text-slate-500">
                or click to browse (jpg, png, gif, webp — max 5MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing screenshot...
            </span>
          ) : (
            "Upload & Analyze"
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500 text-center">
        Your report is 100% anonymous. No personal data is collected.
      </p>
    </div>
  );
}
