import { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";
import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { format } from "date-fns";

import "react-datepicker/dist/react-datepicker.css";

// --- MOCK API & DATA ---
// This section simulates fetching data from a real backend.
// It includes data for floats 008, 010, and an intentional error for 009.

const MOCK_FLOAT_OPTIONS = [
  { value: "R13857_008", label: "R13857_008" },
  { value: "R13857_009", label: "R13857_009" },
  { value: "R13857_010", label: "R13857_010" },
  { value: "R13857_001", label: "R13857_001" },
  { value: "R13857_002", label: "R13857_002" },
  { value: "R13857_003", label: "R13857_003" },
];

const MOCK_DB = {
  R13857_008: {
    metadata: {
      float_id: "R13857_008",
      file: "aoml/13857/profiles/R13857_008.nc",
      date: "1997-10-14 18:39:35",
      date_update: "2018-10-11 18:05:22",
      latitude: 1.761,
      longitude: -21.587,
      ocean: "A",
      profiler_type: 845,
      institution: "AO",
    },
    trajectory: [
      { lat: 1.761, lng: -21.587, date: new Date("1997-10-14T18:39:35Z") },
      { lat: 1.78, lng: -21.65, date: new Date("1997-10-16T12:00:00Z") },
      { lat: 1.81, lng: -21.72, date: new Date("1997-10-18T09:00:00Z") },
    ],
    profile: {
      temp: [25.1, 24.9, 23.5, 22.1, 20.3, 15.2, 11.4, 8.5, 6.2],
      pressure: [10, 50, 100, 150, 200, 400, 600, 800, 1000],
      depth: [9.9, 49.5, 99.1, 148.6, 198.2, 396.5, 594.8, 793.1, 991.5],
      salinity: [35.1, 35.2, 35.5, 35.8, 36.0, 35.4, 35.0, 34.8, 34.7],
      date: new Date("1997-10-14T18:39:35Z"),
    },
  },
  R13857_009: {
    metadata: {
      float_id: "R13857_009",
      file: "aoml/13857/profiles/R13857_009.nc",
      date: "1997-10-25 19:32:34",
      date_update: "2018-10-11 18:05:22",
      latitude: 1.804,
      longitude: -21.774,
      ocean: "A",
      profiler_type: 845,
      institution: "AO",
    },
    trajectory: [
      { lat: 1.804, lng: -21.774, date: new Date("1997-10-25T19:32:34Z") },
      { lat: 1.82, lng: -21.85, date: new Date("1997-10-27T12:00:00Z") },
    ],
    error:
      "No numeric depth/temp/psal values found or parsing returned empty table.",
  },
  R13857_010: {
    metadata: {
      float_id: "R13857_010",
      file: "aoml/13857/profiles/R13857_010.nc",
      date: "1997-11-05 18:51:42",
      date_update: "2018-10-11 18:05:22",
      latitude: 1.642,
      longitude: -21.362,
      ocean: "A",
      profiler_type: 845,
      institution: "AO",
    },
    trajectory: [
      { lat: 1.642, lng: -21.362, date: new Date("1997-11-05T18:51:42Z") },
      { lat: 1.61, lng: -21.29, date: new Date("1997-11-07T12:00:00Z") },
      { lat: 1.58, lng: -21.22, date: new Date("1997-11-09T09:00:00Z") },
    ],
    profile: {
      temp: [25.5, 25.2, 24.1, 22.8, 20.9, 15.8, 11.9, 8.9, 6.5],
      pressure: [12, 52, 103, 155, 205, 410, 610, 815, 1020],
      depth: [11.8, 51.5, 102.1, 153.6, 203.2, 406.5, 604.8, 808.1, 1011.5],
      salinity: [35.0, 35.1, 35.4, 35.7, 35.9, 35.3, 34.9, 34.7, 34.6],
      date: new Date("1997-11-05T18:51:42Z"),
    },
  },
};

const fetchFloatData = async (floatId) => {
  console.log(`Fetching data for ${floatId}...`);
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 300));
  if (MOCK_DB[floatId]) {
    return MOCK_DB[floatId];
  }
  return { error: "Data not found." };
};

// --- STYLES & CONFIG ---

const containerStyle = { width: "100%", height: "400px" };
const plotColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];
const selectStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#1f2937",
    border: "1px solid #4b5563",
  }),
  menu: (styles) => ({ ...styles, backgroundColor: "#1f2937" }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#374151" : "#1f2937",
    color: "white",
    ":active": { ...styles[":active"], backgroundColor: "#3b82f6" },
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: "#3b82f6",
  }),
  multiValueLabel: (styles) => ({ ...styles, color: "white" }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: "white",
    ":hover": { backgroundColor: "#ef4444", color: "white" },
  }),
  input: (styles) => ({ ...styles, color: "white" }),
  singleValue: (styles) => ({ ...styles, color: "white" }),
  placeholder: (styles) => ({ ...styles, color: "#d1d5db" }),
};

// --- MAIN COMPONENT ---

export default function TrajectoryAndComparison() {
  const [selectedFloats, setSelectedFloats] = useState([]);
  const [floatData, setFloatData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Plot controls
  const [tempRepMethod, setTempRepMethod] = useState({
    value: "mean",
    label: "Mean (per profile)",
  });
  const [dateRange, setDateRange] = useState([
    new Date("1997-10-14"),
    new Date("1997-11-05"),
  ]);

  const [startDate, endDate] = dateRange;

  // Map ref
  const mapRef = useRef(null);
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Ensure this is in your .env file
    id: "google-map-script",
  });

  // Fetch data when selection changes
  useEffect(() => {
    const fetchAllSelectedFloatData = async () => {
      setIsLoading(true);
      const newFloatData = { ...floatData };
      for (const floatOption of selectedFloats) {
        if (!newFloatData[floatOption.value]) {
          newFloatData[floatOption.value] = await fetchFloatData(
            floatOption.value
          );
        }
      }
      setFloatData(newFloatData);
      setIsLoading(false);
    };

    if (selectedFloats.length > 0) {
      fetchAllSelectedFloatData();
    } else {
      setFloatData({}); // Clear data if no floats are selected
    }
  }, [selectedFloats]);

  // Auto-zoom map to fit trajectories
  useEffect(() => {
    if (mapRef.current && selectedFloats.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedFloats.forEach((float) => {
        const data = floatData[float.value];
        if (data && data.trajectory) {
          data.trajectory.forEach((point) => bounds.extend(point));
        }
      });
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [floatData, selectedFloats, isLoaded]);

  // --- DATA PROCESSING FOR PLOTS ---
  const getRepresentativeTemp = (profile) => {
    if (!profile || !profile.temp || profile.temp.length === 0) return null;
    switch (tempRepMethod.value) {
      case "mean":
        return profile.temp.reduce((a, b) => a + b, 0) / profile.temp.length;
      case "median":
        const sorted = [...profile.temp].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      case "max":
        return Math.max(...profile.temp);
      case "shallowest":
        const minPres = Math.min(...profile.pressure);
        const idx = profile.pressure.indexOf(minPres);
        return profile.temp[idx];
      default:
        return null;
    }
  };

  const filteredFloatData = Object.values(floatData).filter(
    (data) =>
      data.profile &&
      data.profile.date &&
      (!startDate || data.profile.date >= startDate) &&
      (!endDate || data.profile.date <= endDate)
  );

  // --- RENDER ---
  if (loadError)
    return (
      <div className="p-6 text-red-400">
        Error loading Google Maps. Check your API key.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Profile & Index metadata comparison
        </h1>

        {/* Float Selector */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <label
            htmlFor="float-select"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Select floats for comparison
          </label>
          <Select
            id="float-select"
            isMulti
            options={MOCK_FLOAT_OPTIONS}
            value={selectedFloats}
            onChange={(options) => setSelectedFloats(options || [])}
            closeMenuOnSelect={false}
            styles={selectStyles}
            placeholder="Choose an option"
          />
          <p className="text-xs text-gray-400 mt-2">
            Pick up to 3 floats to compare. Trajectories will be plotted from
            the ingested argo_info table (per-profile lat/lon).
          </p>
        </div>

        {isLoading && (
          <div className="text-center p-4">Loading float data...</div>
        )}

        {selectedFloats.length > 0 && !isLoading && (
          <div className="space-y-8 mt-8">
            {/* Metadata Table */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3">
                Index metadata for selected floats
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-300">
                    <tr>
                      {[
                        "float_id",
                        "file",
                        "date",
                        "latitude",
                        "longitude",
                        "institution",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 border-b border-gray-700"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFloats.map(({ value }) => {
                      const data = floatData[value]?.metadata;
                      return data ? (
                        <tr
                          key={data.float_id}
                          className="border-t border-gray-700"
                        >
                          <td className="px-3 py-2">{data.float_id}</td>
                          <td className="px-3 py-2 font-mono">{data.file}</td>
                          <td className="px-3 py-2">{data.date}</td>
                          <td className="px-3 py-2">{data.latitude}</td>
                          <td className="px-3 py-2">{data.longitude}</td>
                          <td className="px-3 py-2">{data.institution}</td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trajectories Map */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3">
                Trajectories (from argo_info positions)
              </h2>
              <div className="flex justify-end items-center mb-2 space-x-4 text-sm">
                <span className="font-bold">Float ID:</span>
                {selectedFloats.map(({ value }, i) => (
                  <div key={value} className="flex items-center">
                    <div
                      className="w-4 h-0.5 mr-2"
                      style={{
                        backgroundColor: plotColors[i % plotColors.length],
                      }}
                    ></div>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-700">
                 (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: 1.7, lng: -21.6 }}
                    zoom={7}
                    onLoad={onLoad}
                    options={{
                      styles: [
                        // Dark mode map style
                        {
                          elementType: "geometry",
                          stylers: [{ color: "#242f3e" }],
                        },
                        {
                          elementType: "labels.text.stroke",
                          stylers: [{ color: "#242f3e" }],
                        },
                        {
                          elementType: "labels.text.fill",
                          stylers: [{ color: "#746855" }],
                        },
                        {
                          featureType: "administrative.locality",
                          elementType: "labels.text.fill",
                          stylers: [{ color: "#d59563" }],
                        },
                        {
                          featureType: "poi",
                          elementType: "labels.text.fill",
                          stylers: [{ color: "#d59563" }],
                        },
                        {
                          featureType: "road",
                          elementType: "geometry",
                          stylers: [{ color: "#38414e" }],
                        },
                        {
                          featureType: "road",
                          elementType: "geometry.stroke",
                          stylers: [{ color: "#212a37" }],
                        },
                        {
                          featureType: "road",
                          elementType: "labels.text.fill",
                          stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                          featureType: "road.highway",
                          elementType: "geometry",
                          stylers: [{ color: "#746855" }],
                        },
                        {
                          featureType: "transit",
                          elementType: "geometry",
                          stylers: [{ color: "#2f3948" }],
                        },
                        {
                          featureType: "water",
                          elementType: "geometry",
                          stylers: [{ color: "#17263c" }],
                        },
                        {
                          featureType: "water",
                          elementType: "labels.text.fill",
                          stylers: [{ color: "#515c6d" }],
                        },
                      ],
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {selectedFloats.map(({ value }, i) => {
                      const data = floatData[value];
                      return data && data.trajectory ? (
                        <Polyline
                          key={value}
                          path={data.trajectory}
                          options={{
                            strokeColor: plotColors[i % plotColors.length],
                            strokeWeight: 2.5,
                          }}
                        />
                      ) : null;
                    })}
                  </GoogleMap>
                ) : (
                  <div className="h-[400px] flex items-center justify-center bg-gray-700">
                    Loading map...
                  </div>
                )
              </div>
            </div>

            {/* Raw Data Accordion */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg space-y-2">
              <h2 className="text-xl font-semibold mb-3">
                Raw values (from .nc) — depth / temp / psal
              </h2>
              {selectedFloats.map(({ value }) => {
                const data = floatData[value];
                return (
                  <details key={value} className="bg-gray-700 rounded p-2">
                    <summary className="cursor-pointer font-medium">
                      {data?.metadata.file}
                    </summary>
                    <div className="mt-2 p-2 bg-gray-900/50 rounded">
                      {data?.error ? (
                        <p className="text-red-400">{data.error}</p>
                      ) : data?.profile ? (
                        <div className="overflow-x-auto max-h-60">
                          <table className="min-w-full text-left text-xs">
                            <thead>
                              <tr>
                                {["depth", "temp", "pressure", "salinity"].map(
                                  (h) => (
                                    <th key={h} className="p-1">
                                      {h}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {data.profile.depth.map((_, i) => (
                                <tr key={i}>
                                  <td className="p-1">
                                    {data.profile.depth[i]}
                                  </td>
                                  <td className="p-1">
                                    {data.profile.temp[i]}
                                  </td>
                                  <td className="p-1">
                                    {data.profile.pressure[i]}
                                  </td>
                                  <td className="p-1">
                                    {data.profile.salinity[i]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No profile data available.</p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>

            {/* Scientific Plots */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3">Profile Plots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Plot
                  data={selectedFloats.map(({ value }, i) => {
                    const data = floatData[value];
                    return data?.profile
                      ? {
                          x: data.profile.temp,
                          y: data.profile.depth,
                          name: value,
                          type: "scatter",
                          mode: "lines",
                          line: { color: plotColors[i % plotColors.length] },
                        }
                      : {};
                  })}
                  layout={{
                    title: "Temperature vs Depth (profile)",
                    xaxis: {
                      title: "Temperature (instrument units)",
                      color: "white",
                    },
                    yaxis: {
                      title: "Depth (instrument units)",
                      autorange: "reversed",
                      color: "white",
                    },
                    plot_bgcolor: "#1f2937",
                    paper_bgcolor: "#1f2937",
                    font: { color: "white" },
                    showlegend: true,
                  }}
                  className="w-full h-[500px]"
                />
                <Plot
                  data={selectedFloats.map(({ value }, i) => {
                    const data = floatData[value];
                    return data?.profile
                      ? {
                          x: data.profile.pressure,
                          y: data.profile.depth,
                          name: value,
                          type: "scatter",
                          mode: "lines",
                          line: { color: plotColors[i % plotColors.length] },
                        }
                      : {};
                  })}
                  layout={{
                    title: "Pressure vs Depth (profile)",
                    xaxis: {
                      title: "Pressure (instrument units)",
                      color: "white",
                    },
                    yaxis: {
                      title: "Depth (instrument units)",
                      autorange: "reversed",
                      color: "white",
                    },
                    plot_bgcolor: "#1f2937",
                    paper_bgcolor: "#1f2937",
                    font: { color: "white" },
                    showlegend: true,
                  }}
                  className="w-full h-[500px]"
                />
              </div>
            </div>

            {/* Time Series Plot */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3">
                Temperature vs Time (Per-profile representative)
              </h2>
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <div className="w-full md:w-1/3">
                  <label className="text-sm">
                    Representative temp per profile
                  </label>
                  <Select
                    options={[
                      { value: "mean", label: "Mean (per profile)" },
                      { value: "median", label: "Median (per profile)" },
                      { value: "max", label: "Max (per profile)" },
                      {
                        value: "shallowest",
                        label: "Shallowest (temp at minimum pres)",
                      },
                    ]}
                    value={tempRepMethod}
                    onChange={setTempRepMethod}
                    styles={selectStyles}
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-sm">
                    Filter date range (optional)
                  </label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    isClearable={true}
                    dateFormat="yyyy/MM/dd"
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  />
                </div>
              </div>

              <Plot
                data={selectedFloats.map(({ value }, i) => {
                  const validProfiles = filteredFloatData.filter(
                    (d) => d.metadata.float_id === value
                  );
                  return {
                    x: validProfiles.map((d) => d.profile.date),
                    y: validProfiles.map((d) =>
                      getRepresentativeTemp(d.profile)
                    ),
                    name: value,
                    type: "scatter",
                    mode: "markers",
                    marker: {
                      color: plotColors[i % plotColors.length],
                      size: 8,
                    },
                  };
                })}
                layout={{
                  xaxis: { title: "Date", color: "white" },
                  yaxis: {
                    title: "Temperature (units in data)",
                    color: "white",
                  },
                  plot_bgcolor: "#1f2937",
                  paper_bgcolor: "#1f2937",
                  font: { color: "white" },
                  showlegend: true,
                  height: 400,
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
