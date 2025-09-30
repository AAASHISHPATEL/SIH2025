import { useState, useRef, useEffect } from "react";

const API_ENDPOINT = import.meta.env.VITE_ARGO_BACKEND_INGEST_URL;
const ARGO_BASE_URL = "https://data-argo.ifremer.fr/dac/";

export default function Ingest() {
  const [files, setFiles] = useState([]);
  const [indexPaths, setIndexPaths] = useState("");
  const [maxFiles, setMaxFiles] = useState(10);
  const [status, setStatus] = useState({ msg: "", type: "" });

  // File upload state is unchanged
  const updateStatus = (msg, type = "info") => setStatus({ msg, type });

  // ---------- URL INGEST PROGRESS + STOP ----------
  const [loading, setLoading] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const ingestXhrRef = useRef(null);
  const ingestTimerRef = useRef(null);

  // optimistic progress: smoothly increment up to 90%
  const startOptimisticProgress = () => {
    clearInterval(ingestTimerRef.current);
    setIngestProgress(5);
    ingestTimerRef.current = setInterval(() => {
      setIngestProgress((p) => {
        if (p >= 90) return 90;
        // ease: smaller increments as it grows
        const step = Math.max(1, Math.round((100 - p) * 0.05));
        return Math.min(p + step, 90);
      });
    }, 400);
  };

  const stopOptimisticProgress = () => {
    clearInterval(ingestTimerRef.current);
    ingestTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopOptimisticProgress();
      if (ingestXhrRef.current) ingestXhrRef.current.abort();
    };
  }, []);
  // ------------------------------------------------

  // Normalize ARGO input (full URL or relative path)
  const normalizeArgoInput = (input) => {
    try {
      new URL(input);
      return input; // absolute URL ok
    } catch {
      return `${ARGO_BASE_URL}${input.replace(/^\/+/, "")}`;
    }
  };

  // Ingest via URL/Path with progress + stop
  const handleUrlIngest = () => {
    const rawInput = indexPaths.trim();
    if (!rawInput) {
      updateStatus("Please enter a valid ARGO URL or path.", "error");
      return;
    }

    const argoUrl = normalizeArgoInput(rawInput);

    // Start request
    setLoading(true);
    setIngestProgress(0);
    updateStatus(`Starting ingestion for: ${argoUrl}`, "info");
    startOptimisticProgress();

    const xhr = new XMLHttpRequest();
    ingestXhrRef.current = xhr;

    xhr.onload = () => {
      stopOptimisticProgress();
      let data = {};
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        setIngestProgress(100);
        updateStatus(
          `Ingestion successful! Saved ${
            data.total_records_saved || 0
          } measurements.`,
          "success"
        );
      } else {
        setIngestProgress(0);
        updateStatus(
          `Server Error: ${data.error || xhr.statusText || "Unknown error."}`,
          "error"
        );
      }
      setLoading(false);
      ingestXhrRef.current = null;
    };

    xhr.onerror = () => {
      stopOptimisticProgress();
      setIngestProgress(0);
      updateStatus("Network error during ingestion.", "error");
      setLoading(false);
      ingestXhrRef.current = null;
    };

    xhr.onabort = () => {
      stopOptimisticProgress();
      setIngestProgress(0);
      updateStatus("Ingestion cancelled.", "info");
      setLoading(false);
      ingestXhrRef.current = null;
    };

    xhr.open("POST", API_ENDPOINT);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ argo_url: argoUrl }));
  };

  const handleCancelIngest = () => {
    if (ingestXhrRef.current && loading) {
      ingestXhrRef.current.abort();
    }
  };

  // ---------- FILE UPLOAD (unchanged except we already had progress + stop) ----------
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > maxFiles) {
      updateStatus(`You can upload a maximum of ${maxFiles} files.`, "error");
      return;
    }

    const newFiles = selected.map((file) => ({
      file,
      percent: 0,
      status: "ready",
      xhr: null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileUpload = (fileObj) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", fileObj.file);

    fileObj.xhr = xhr;

    setFiles((prev) =>
      prev.map((f) =>
        f.file.name === fileObj.file.name ? { ...f, status: "uploading" } : f
      )
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === fileObj.file.name ? { ...f, percent } : f
          )
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText || "{}");
        } catch {
          data = {};
        }
        updateStatus(
          `File uploaded successfully! Saved ${
            data.total_records_saved || 0
          } measurements.`,
          "success"
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === fileObj.file.name
              ? { ...f, status: "complete", percent: 100 }
              : f
          )
        );
      } else {
        updateStatus(`Server Error: ${xhr.statusText}`, "error");
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === fileObj.file.name ? { ...f, status: "error" } : f
          )
        );
      }
    };

    xhr.onerror = () => {
      updateStatus("Network error during upload.", "error");
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === fileObj.file.name ? { ...f, status: "error" } : f
        )
      );
    };

    xhr.onabort = () => {
      updateStatus(`Upload cancelled: ${fileObj.file.name}`, "info");
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === fileObj.file.name
            ? { ...f, status: "cancelled", percent: 0 }
            : f
        )
      );
    };

    xhr.open("POST", API_ENDPOINT);
    xhr.send(formData);
  };

  const handleCancelUpload = (fileObj) => {
    if (fileObj.xhr && fileObj.status === "uploading") {
      fileObj.xhr.abort();
    }
  };
  // -----------------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Status Banner */}
        {status.msg && (
          <div
            className={`p-4 rounded-lg text-sm border ${
              status.type === "error"
                ? "bg-red-100 border-red-400 text-red-700"
                : status.type === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-blue-100 border-blue-400 text-blue-700"
            }`}
          >
            <p className="font-bold capitalize">{status.type}:</p>
            <p>{status.msg}</p>
          </div>
        )}

        {/* Section 1: Upload local .nc file */}
        <div className="bg-[#1b263b] p-6 rounded-2xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">
            Upload ARGO NetCDF Files
          </h2>
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:bg-[#0d1b2a]/50 transition">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="fileUpload"
              accept=".nc"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer text-gray-300"
            >
              <div className="text-2xl mb-2">⬆️</div>
              <div>Drop NetCDF files here</div>
              <div className="text-sm text-gray-400">or click to browse</div>
            </label>
          </div>

          {/* Upload progress / action */}
          <div className="mt-4 space-y-2">
            {files.map((fileObj) => (
              <div
                key={fileObj.file.name}
                className="bg-[#0d1b2a] p-3 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{fileObj.file.name}</div>
                    <div className="text-sm text-gray-400">
                      {fileObj.status === "ready" && "Ready to upload"}
                      {fileObj.status === "uploading" &&
                        `Uploading... ${fileObj.percent}%`}
                      {fileObj.status === "complete" && "Upload complete"}
                      {fileObj.status === "error" && "Upload failed"}
                      {fileObj.status === "cancelled" && "Upload cancelled"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {fileObj.status === "ready" && (
                      <button
                        onClick={() => handleFileUpload(fileObj)}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-500"
                      >
                        Upload
                      </button>
                    )}
                    {fileObj.status === "uploading" && (
                      <button
                        onClick={() => handleCancelUpload(fileObj)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-500"
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>
                {(fileObj.status === "uploading" ||
                  fileObj.status === "complete") && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        fileObj.status === "complete"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${fileObj.percent}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Bulk ingest via URL / paths */}
        <div className="bg-[#1b263b] p-6 rounded-2xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">
            Bulk ingest / Ingest via URL or Path
          </h2>
          <p className="text-gray-400 text-sm mb-3">
            Enter either:
            <br />• Full ARGO URL →{" "}
            <span className="text-green-400">
              https://data-argo.ifremer.fr/dac/aoml/1901820/1901820_prof.nc
            </span>
            <br />• Relative path →{" "}
            <span className="text-green-400">aoml/1901820/1901820_prof.nc</span>
          </p>
          <textarea
            value={indexPaths}
            onChange={(e) => setIndexPaths(e.target.value)}
            placeholder="Index file paths or ARGO URL"
            rows={6}
            className="w-full p-3 bg-[#0d1b2a] border border-gray-700 rounded-lg text-white resize-none"
          />
          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm text-gray-300">
              Max files to download
            </label>
            <input
              type="number"
              value={maxFiles}
              onChange={(e) => setMaxFiles(e.target.value)}
              className="p-2 w-24 rounded bg-[#0d1b2a] border border-gray-700 text-white"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUrlIngest}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Ingesting..." : "Download & ingest"}
            </button>

            {loading && (
              <button
                onClick={handleCancelIngest}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                Stop
              </button>
            )}
          </div>

          {/* Ingest progress bar + % */}
          {loading && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Ingestion Progress</span>
                <span>{ingestProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${ingestProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
