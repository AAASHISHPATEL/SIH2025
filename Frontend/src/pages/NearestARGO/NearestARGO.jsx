import React, { useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

export default function NearestARGO() {
  // Inputs
  const [lat, setLat] = useState(20);
  const [lon, setLon] = useState(90);
  const [limit, setLimit] = useState(10);

  const [place, setPlace] = useState("Arabian Sea");
  const [year, setYear] = useState("");
  const [institution, setInstitution] = useState("");
  const [placeLimit, setPlaceLimit] = useState(200);

  // Results & selection
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  // Map ref
  const mapRef = useRef(null);
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    id: "google-map-script",
  });

  // Dummy fetch — replace with real API
  const fetchNearest = () => {
    const n = Math.max(1, Number(limit) || 10);
    const baseLat = Number(lat) || 0;
    const baseLon = Number(lon) || 0;

    const data = Array.from({ length: n }, (_, i) => {
      return {
        id: i + 1,
        lat: +(baseLat + (Math.random() - 0.5) * 6).toFixed(5),
        lon: +(baseLon + (Math.random() - 0.5) * 6).toFixed(5),
        file: `csio/profile_${String(i + 1).padStart(3, "0")}.nc`,
        date: `2021${(i + 1).toString().padStart(2, "0")}150000`,
        institution: ["IN", "HZ", "AO"][i % 3],
        ocean: "I",
      };
    });

    // place-results first (if place input used) -> for now we just keep single array
    setResults(data);
    setSelected(null);

    // scroll to map & fit bounds after results set (use a small timeout so DOM updated)
    setTimeout(() => {
      const el = document.getElementById("map-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

      if (mapRef.current && data.length) {
        const bounds = new window.google.maps.LatLngBounds();
        data.forEach((r) => {
          bounds.extend({ lat: r.lat, lng: r.lon });
        });
        mapRef.current.fitBounds(bounds);
      }
    }, 150);
  };

  // Example place geocode + fetch (dummy): geocode place -> set center and fetch neighbours
  const fetchPlaceAndNearest = async () => {
    // If you have geocoding API, call it here. For demo use random offset around center.
    // We'll just call fetchNearest (or adapt to call remote geocode+search).
    fetchNearest();
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

  if (loadError) {
    return (
      <div className="p-6 text-red-400">
        Error loading Google Maps. Check your API key and console.
      </div>
    );
  }

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
                onChange={(e) => setLat(e.target.value)}
                className="p-2 rounded bg-gray-700 border border-gray-600"
              />
            </label>

            <label className="flex flex-col text-sm">
              <span className="text-gray-300 mb-1">Longitude</span>
              <input
                type="number"
                step="any"
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

          {/* Map */}
          <div className="rounded-lg overflow-hidden border border-gray-700">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: Number(lat) || 0, lng: Number(lon) || 0 }}
                zoom={6}
                onLoad={onLoad}
              >
                {/* Markers */}
                {results.map((r, idx) => (
                  <Marker
                    key={r.id || idx}
                    position={{ lat: r.lat, lng: r.lon }}
                    label={{
                      text: `${idx + 1}`,
                      className: "text-sm",
                    }}
                    onClick={() => setSelected({ ...r, idx })}
                  />
                ))}

                {/* InfoWindow for selected */}
                {selected && (
                  <InfoWindow
                    position={{ lat: selected.lat, lng: selected.lon }}
                    onCloseClick={() => setSelected(null)}
                  >
                    <div className="text-black">
                      <div className="font-semibold">{selected.file}</div>
                      <div>
                        Lat: {selected.lat}, Lon: {selected.lon}
                      </div>
                      <div>Inst: {selected.institution}</div>
                      <div>Date: {selected.date}</div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <div className="h-[600px] flex items-center justify-center">
                Loading map...
              </div>
            )}
          </div>

          {/* Summary + Table */}
          <div className="text-sm text-gray-300 mt-2">
            Mapped rows: {results.length}
          </div>

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
                    onClick={() => {
                      setSelected({ ...r, idx: i });
                      // pan map to marker
                      if (mapRef.current) {
                        mapRef.current.panTo({ lat: r.lat, lng: r.lon });
                        mapRef.current.setZoom(8);
                      }
                    }}
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
        </div>
      </div>
    </div>
  );
}
