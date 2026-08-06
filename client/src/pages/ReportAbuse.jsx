import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadScreenshot } from "../services/api";
import PatternDivider from "../components/PatternDivider";

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
      setError("Please upload an image file (jpg, png, gif, webp).");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
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

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        handleFile(blob);
        return;
      }
    }
  }

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please select a screenshot first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await uploadScreenshot(file);
      navigate("/results", { state: { report: result.report } });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "We couldn't read the image clearly. Try another screenshot or type the message.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Report Online Abuse
          </h1>
          <p className="text-blue-200">
            Tell us what happened. Your report can remain anonymous.
          </p>
        </div>
      </section>

      <PatternDivider />

      {/* Form */}
      <div className="max-w-2xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-blue bg-blue-bg scale-[1.01]"
                : preview
                ? "border-green bg-green-50"
                : "border-soft hover:border-blue hover:bg-blue-bg"
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
              <div className="animate-fade-in-up">
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="max-h-64 mx-auto rounded-xl shadow-md mb-4"
                />
                <p className="text-sm text-green font-medium">{file.name}</p>
                <p className="text-xs text-slate-gray mt-1">
                  Click or drop to replace
                </p>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">📸</div>
                <p className="font-semibold text-navy mb-2">
                  Drop your screenshot here
                </p>
                <p className="text-sm text-slate-gray">
                  or click to browse, or paste from clipboard (Ctrl+V)
                </p>
                <p className="text-xs text-slate-gray mt-2">
                  jpg, png, gif, webp — max 5MB
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-soft border border-red/20 rounded-2xl text-red text-sm animate-fade-in-up">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || loading}
            className="mt-6 w-full bg-blue text-white font-semibold py-4 rounded-2xl hover:bg-blue-dark disabled:bg-soft disabled:text-slate-gray disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing your screenshot...
              </>
            ) : (
              <>
                <span className="text-xl">🤖</span>
                Upload & Analyze
              </>
            )}
          </button>
        </form>

        {/* Reassurance */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <span className="text-green">✓</span>
            <span className="text-sm text-green font-medium">
              100% anonymous — no personal data collected
            </span>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-8 ai-card">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">💙</span>
            <div>
              <p className="font-semibold text-navy mb-1">
                You did the right thing by asking for help.
              </p>
              <p className="text-sm text-slate-gray">
                Our AI will analyze the message and provide clear guidance on what
                to do next. You are safe here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
