import { useState } from "react";
import MapplsMap from "../../components/MapplsMap";

export default function NearestARGO() {
  const [lat, setLat] = useState();
  const [lon, setLon] = useState();
  const [limit, setLimit] = useState();

  const [place, setPlace] = useState("");
  const [year, setYear] = useState("");
  const [institution, setInstitution] = useState("");

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchNearest = () => {
    const n = Math.max(1, Number(limit) || 10);
    const baseLat = Number(lat) || 0;
    const baseLon = Number(lon) || 0;

    const data = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      lat: +(baseLat + (Math.random() - 0.5) * 6).toFixed(5),
      lon: +(baseLon + (Math.random() - 0.5) * 6).toFixed(5),
      file: `csio/profile_${String(i + 1).padStart(3, "0")}.nc`,
      date: `2021${(i + 1).toString().padStart(2, "0")}150000`,
      institution: ["IN", "HZ", "AO"][i % 3],
      ocean: "I",
    }));

    setResults(data);
    setSelected(null);
  };

  const fetchPlaceAndNearest = () => {
    fetchNearest(); // for now just reuse
  };

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          Nearest ARGO floats / Place lookup
        </h1>

        {/* Inputs */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">Latitude</span>
              <input
                type="number"
                step="any"
                value={lat}
                placeholder="e.g., 20.5937"
                onChange={(e) => setLat(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">Longitude</span>
              <input
                type="number"
                step="any"
                placeholder="e.g., 78.9629"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">Limit</span>
              <input
                type="number"
                value={limit}
                placeholder="e.g., 10"
                min={1}
                onChange={(e) => setLimit(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={fetchNearest}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
              >
                Find nearest floats
              </button>
            </div>
          </div>

          {/* Place lookup optional */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h2 className="text-lg font-medium text-gray-100 mb-3">
              Place lookup (optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Place name (e.g., 'Arabian Sea')"
              />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Institution (optional)"
              />
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
                placeholder="Year (optional)"
              />
            </div>

            <div className="mt-3 flex gap-3">
              <button
                onClick={fetchPlaceAndNearest}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
              >
                Find place lat/lon and nearby ARGO floats (geocode)
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
            <MapplsMap
              results={results}
              // selected={selected}
              setSelected={setSelected}
            />
          ) : (
            <div className="h-[600px] flex items-center justify-center border border-gray-700 rounded-lg">
              No map data yet
            </div>
          )}

          {/* Summary + Table */}
          <div className="text-sm text-gray-300 mt-2">
            Mapped rows: {results.length}
          </div>

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
