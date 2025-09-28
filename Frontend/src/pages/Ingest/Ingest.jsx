import  { useState } from "react";

export default function Ingest() {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [indexPaths, setIndexPaths] = useState("");
  const [maxFiles, setMaxFiles] = useState(10);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);

    selected.forEach((file) => simulateUpload(file));
  };

  // Simulate upload with progress
  const simulateUpload = (file) => {
    setUploadProgress((prev) => ({
      ...prev,
      [file.name]: { status: "uploading", percent: 0 },
    }));

    let percent = 0;
    const interval = setInterval(() => {
      percent += 10;
      if (percent >= 100) {
        clearInterval(interval);
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { status: "complete", percent: 100 },
        }));
      } else {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { status: "uploading", percent },
        }));
      }
    }, 200);
  };

  // Handle manual ingest
  const handleManualIngest = () => {
    console.log("Index paths:", indexPaths.split("\n"));
    console.log("Max files:", maxFiles);
    alert("Manual ingest started!");
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section 1: Local upload */}
        <div className="bg-[#1b263b] p-6 rounded-2xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">
            Upload ARGO NetCDF Files
          </h2>
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:bg-[#0d1b2a]/50 transition">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="fileUpload"
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

          {/* Upload progress */}
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="bg-[#0d1b2a] p-3 rounded-lg border border-gray-700 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-400">
                    {uploadProgress[file.name]?.status === "complete"
                      ? "Upload complete"
                      : `Uploading... ${
                          uploadProgress[file.name]?.percent || 0
                        }%`}
                  </div>
                </div>
                {uploadProgress[file.name]?.status === "complete" ? (
                  <span className="text-green-400 font-semibold">✓</span>
                ) : (
                  <span className="text-blue-400">⏳</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Bulk ingest by paths */}
        <div className="bg-[#1b263b] p-6 rounded-2xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">
            Bulk ingest by manual index paths
          </h2>
          <p className="text-gray-400 text-sm mb-3">
            Paste index file paths (one per line), e.g.{" "}
            <span className="text-green-400">
              aoml/13857/profiles/R13857_001.nc
            </span>
          </p>
          <textarea
            value={indexPaths}
            onChange={(e) => setIndexPaths(e.target.value)}
            placeholder="Index file paths"
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
          <button
            onClick={handleManualIngest}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
          >
            Download & ingest paths
          </button>
        </div>
      </div>
    </div>
  );
}
