import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, AlertTriangle, CheckCircle, Loader2, Shield } from "lucide-react";
import { uploadScreenshot, submitManualReport } from "../services/api";
import PatternDivider from "../components/PatternDivider";

export default function ReportAbuse() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
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
    if (!file && !manualText.trim()) {
      setError("Please select a screenshot or type the message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (file) {
        result = await uploadScreenshot(file);
      } else {
        result = await submitManualReport(manualText);
      }
      navigate("/results", { state: { report: result.report } });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Something went wrong. Please try again.";
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
                ? "border-green bg-green-50 scale-[1.01]"
                : preview
                ? "border-green bg-green-50"
                : "border-soft hover:border-green hover:bg-green-50"
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 flex items-center justify-center">
                  <Camera size={32} className="text-blue" />
                </div>
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
            <div className="mt-4 p-4 bg-red-soft border border-red/20 rounded-2xl text-red text-sm animate-fade-in-up flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(true);
                  setError(null);
                }}
                className="ml-2 underline font-medium hover:text-red-dark"
              >
                Type the message instead
              </button>
            </div>
          )}

          {/* Manual text input */}
          {showManualInput && (
            <div className="mt-4 animate-fade-in-up">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type or paste the harmful message here..."
                className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-blue/20 outline-none transition-all resize-none"
                rows={4}
              />
              <p className="text-xs text-slate-gray mt-1">
                You can type the message directly if the screenshot doesn't work.
              </p>
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
                <Loader2 size={20} className="animate-spin" />
                Analyzing your screenshot...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload & Analyze
              </>
            )}
          </button>
        </form>

        {/* Reassurance */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <CheckCircle size={16} className="text-green" />
            <span className="text-sm text-green font-medium">
              100% anonymous — no personal data collected
            </span>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-8 ai-card">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-blue" />
            </div>
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
