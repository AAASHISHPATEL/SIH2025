import { useState } from "react";
import MapplsMap from "../../components/MapplsMap";

export default function ExploreIndex() {
  // Filter states
  const [latMin, setLatMin] = useState(23.5);
  const [latMax, setLatMax] = useState(23.6);
  const [lonMin, setLonMin] = useState(87.2);
  const [lonMax, setLonMax] = useState(87.3);
  const [ocean, setOcean] = useState("");
  const [institution, setInstitution] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState();

  // Results & selection
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  // Dummy fetch — replace with real API call
  const fetchNearest = () => {
    const n = Math.max(1, Number(limit) || 10);
    const latMinNum = Number(latMin);
    const latMaxNum = Number(latMax);
    const lonMinNum = Number(lonMin);
    const lonMaxNum = Number(lonMax);

    const data = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      lat: +(latMinNum + Math.random() * (latMaxNum - latMinNum)).toFixed(5),
      lon: +(lonMinNum + Math.random() * (lonMaxNum - lonMinNum)).toFixed(5),
      file: `csio/profile_${String(i + 1).padStart(3, "0")}.nc`,
      date: dateFrom || `202012${(i + 1).toString().padStart(2, "0")}000000`,
      institution: institution || ["IN", "HZ", "AO"][i % 3],
      ocean: ocean || "A",
    }));

    setResults(data);
    setSelected(null);
  };

  // CSV download
  const downloadCSV = () => {
    if (!results.length) return;
    const header = "lat,lon,file,date,institution,ocean\n";
    const rows = results
      .map(
        (r) =>
          `${r.lat},${r.lon},${r.file},${r.date},${r.institution},${r.ocean}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "argo_results.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          Explore ARGO Index (SQLite/Postgres)
        </h1>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-100 mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* lat_min */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">lat_min</span>
              <input
                type="number"
                value={latMin}
                onChange={(e) => setLatMin(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            {/* lat_max */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">lat_max</span>
              <input
                type="number"
                value={latMax}
                onChange={(e) => setLatMax(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            {/* lon_min */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">lon_min</span>
              <input
                type="number"
                value={lonMin}
                onChange={(e) => setLonMin(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            {/* lon_max */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">lon_max</span>
              <input
                type="number"
                value={lonMax}
                onChange={(e) => setLonMax(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            {/* Ocean */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">Ocean</span>
              <select
                value={ocean}
                onChange={(e) => setOcean(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              >
                <option value="">Select Ocean</option>
                <option value="A">Atlantic (A)</option>
                <option value="P">Pacific (P)</option>
                <option value="I">Indian (I)</option>
                <option value="S">Southern (S)</option>
              </select>
            </label>

            {/* Institution */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">Institution</span>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              >
                <option value="">Select Institution</option>
                <option value="AO">AO - Australia (CSIRO)</option>
                <option value="IN">IN - India (INCOIS / NIO)</option>
                <option value="HZ">HZ - China</option>
                <option value="JA">JA - Japan (JAMSTEC)</option>
                <option value="KO">KO - South Korea</option>
                <option value="RU">RU - Russia</option>
                <option value="US">US - USA (NOAA / SIO / AOML / WHOI)</option>
                <option value="FR">FR - France (Coriolis / IFREMER)</option>
                <option value="UK">UK - United Kingdom</option>
                <option value="BR">BR - Brazil</option>
                <option value="ZA">ZA - South Africa</option>
                <option value="CA">CA - Canada</option>
                <option value="NZ">NZ - New Zealand</option>
              </select>
            </label>

            {/* date_from */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">
                date_from (YYYYMMDDHHMMSS)
              </span>
              <input
                type="text"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            {/* date_to */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">
                date_to (YYYYMMDDHHMMSS)
              </span>
              <input
                type="text"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            {/* limit */}
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">limit</span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            <div className="flex items-end">
              <button
                onClick={fetchNearest}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
              >
                Run index query
              </button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div id="map-section" className="space-y-3">
          <div className="bg-blue-900/30 text-blue-100 p-3 rounded">
            Bounding box: (auto-fit to mapped results)
          </div>

          {results.length >= 0 ? (
            <MapplsMap results={results} setSelected={setSelected} />
          ) : (
            <div className="h-[600px] flex items-center justify-center border border-gray-700 rounded-lg">
              No map data yet
            </div>
          )}

          <div className="text-sm text-gray-300 mt-2">
            Mapped rows: {results.length}
          </div>

          {/* Results Table */}
          {results.length > 0 && (
            <>
              <div className="overflow-auto max-h-96 bg-gray-800 rounded border border-gray-700 p-2">
                <table className="min-w-full text-left">
                  <thead className="text-gray-300">
                    <tr>
                      <th className="px-2 py-1">#</th>
                      <th className="px-2 py-1">lat</th>
                      <th className="px-2 py-1">lon</th>
                      <th className="px-2 py-1">file</th>
                      <th className="px-2 py-1">date</th>
                      <th className="px-2 py-1">inst</th>
                      <th className="px-2 py-1">ocean</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={i}
                        className={`border-t border-gray-700 hover:bg-gray-700 cursor-pointer ${
                          selected && selected.id === r.id ? "bg-gray-700" : ""
                        }`}
                        onClick={() => setSelected(r)}
                      >
                        <td className="px-2 py-1 text-gray-200">{i + 1}</td>
                        <td className="px-2 py-1">{r.lat}</td>
                        <td className="px-2 py-1">{r.lon}</td>
                        <td className="px-2 py-1">{r.file}</td>
                        <td className="px-2 py-1">{r.date}</td>
                        <td className="px-2 py-1">{r.institution}</td>
                        <td className="px-2 py-1">{r.ocean}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                >
                  Download mapped points as CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
