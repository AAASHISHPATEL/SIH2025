import { useState, useEffect } from "react";
import Select from "react-select";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- mock float options + DB (trimmed for brevity, keep your full MOCK_DB) ---
const MOCK_FLOAT_OPTIONS = [
  { value: "R13857_008", label: "R13857_008" },
  { value: "R13857_009", label: "R13857_009" },
  { value: "R13857_010", label: "R13857_010" },
];

// [keep your MOCK_DB here]

const fetchFloatData = async (id) =>
  new Promise((res) =>
    setTimeout(() => res(MOCK_DB[id] || { error: "Not found" }), 200)
  );

const plotColors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
];

const selectStyles = {
  control: (s) => ({
    ...s,
    background: "#1f2937",
    border: "1px solid #4b5563",
  }),
  menu: (s) => ({ ...s, background: "#1f2937" }),
  option: (s, { isSelected, isFocused }) => ({
    ...s,
    background: isSelected ? "#3b82f6" : isFocused ? "#374151" : "#1f2937",
    color: "white",
  }),
  input: (s) => ({ ...s, color: "white" }),
  singleValue: (s) => ({ ...s, color: "white" }),
  placeholder: (s) => ({ ...s, color: "#9ca3af" }),
};

export default function ArgoPlots() {
  const [selected, setSelected] = useState([]);
  const [floatData, setFloatData] = useState({});
  const [loading, setLoading] = useState(false);

  const [tempMethod, setTempMethod] = useState({
    value: "mean",
    label: "Mean (per profile)",
  });
  const [range, setRange] = useState([null, null]);
  const [start, end] = range;

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const upd = { ...floatData };
      for (const f of selected) {
        if (!upd[f.value]) upd[f.value] = await fetchFloatData(f.value);
      }
      setFloatData(upd);
      setLoading(false);
    };
    if (selected.length) run();
  }, [selected]);

  const getRepTemp = (p) => {
    if (!p?.temp?.length) return null;
    switch (tempMethod.value) {
      case "mean":
        return p.temp.reduce((a, b) => a + b, 0) / p.temp.length;
      case "median":
        const s = [...p.temp].sort((a, b) => a - b);
        const m = Math.floor(s.length / 2);
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
      case "max":
        return Math.max(...p.temp);
      case "shallowest":
        const i = p.pressure.indexOf(Math.min(...p.pressure));
        return p.temp[i];
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">
        Argo Float Profile & Time Plots
      </h1>

      {/* Float Selector */}
      <Select
        isMulti
        options={MOCK_FLOAT_OPTIONS}
        value={selected}
        onChange={(o) => setSelected(o || [])}
        styles={selectStyles}
        placeholder="Type to filter floats…"
      />

      {loading && <div className="mt-4">Loading data…</div>}

      {selected.length > 0 && !loading && (
        <>
          {/* Side-by-side profile plots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Plot
              data={selected.map((s, i) => {
                const p = floatData[s.value]?.profile;
                return p
                  ? {
                      x: p.temp,
                      y: p.depth,
                      name: s.value,
                      type: "scatter",
                      mode: "lines",
                      line: { color: plotColors[i % plotColors.length] },
                    }
                  : {};
              })}
              layout={{
                title: "Temperature vs Depth (profile)",
                xaxis: { title: "Temperature (units in data)", color: "white" },
                yaxis: {
                  title: "Depth (instrument units)",
                  autorange: "reversed",
                  color: "white",
                },
                plot_bgcolor: "#111827",
                paper_bgcolor: "#111827",
                font: { color: "white" },
              }}
              className="w-full h-[400px]"
            />

            <Plot
              data={selected.map((s, i) => {
                const p = floatData[s.value]?.profile;
                return p
                  ? {
                      x: p.pressure,
                      y: p.depth,
                      name: s.value,
                      type: "scatter",
                      mode: "lines",
                      line: { color: plotColors[i % plotColors.length] },
                    }
                  : {};
              })}
              layout={{
                title: "Pressure vs Depth (profile)",
                xaxis: { title: "Pressure (instrument units)", color: "white" },
                yaxis: {
                  title: "Depth (instrument units)",
                  autorange: "reversed",
                  color: "white",
                },
                plot_bgcolor: "#111827",
                paper_bgcolor: "#111827",
                font: { color: "white" },
              }}
              className="w-full h-[400px]"
            />
          </div>

          {/* Temperature vs Time */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-6">
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm mb-1">
                  Representative temp per profile (aggregation)
                </label>
                <Select
                  options={[
                    { value: "mean", label: "Mean (per profile)" },
                    { value: "median", label: "Median (per profile)" },
                    { value: "max", label: "Max (per profile)" },
                    {
                      value: "shallowest",
                      label: "Shallowest (temp at min pressure)",
                    },
                  ]}
                  value={tempMethod}
                  onChange={setTempMethod}
                  styles={selectStyles}
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm mb-1">
                  Filter date range (optional)
                </label>
                <DatePicker
                  selectsRange
                  startDate={start}
                  endDate={end}
                  onChange={setRange}
                  isClearable
                  dateFormat="yyyy/MM/dd"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                />
              </div>
              <button
                onClick={() => {
                  // simple CSV download
                  const rows = [["float_id", "date", "rep_temp"]];
                  selected.forEach((s) => {
                    const d = floatData[s.value];
                    if (d?.profile) {
                      rows.push([
                        s.value,
                        d.profile.date.toISOString(),
                        getRepTemp(d.profile),
                      ]);
                    }
                  });
                  const csv =
                    "data:text/csv;charset=utf-8," +
                    rows.map((r) => r.join(",")).join("\n");
                  const link = document.createElement("a");
                  link.href = encodeURI(csv);
                  link.download = "rep_temp_timeseries.csv";
                  link.click();
                }}
                className="bg-blue-600 px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
              >
                Download CSV
              </button>
            </div>

            <Plot
              data={selected.map((s, i) => {
                const d = floatData[s.value];
                if (!d?.profile) return {};
                const dt = d.profile.date;
                if ((start && dt < start) || (end && dt > end)) return {};
                return {
                  x: [dt],
                  y: [getRepTemp(d.profile)],
                  name: s.value,
                  type: "scatter",
                  mode: "markers+lines",
                  marker: { color: plotColors[i % plotColors.length], size: 8 },
                  line: { color: plotColors[i % plotColors.length] },
                };
              })}
              layout={{
                title: "Temperature vs Time (per-profile representative)",
                xaxis: { title: "Date", color: "white" },
                yaxis: { title: "Temperature (units in data)", color: "white" },
                plot_bgcolor: "#111827",
                paper_bgcolor: "#111827",
                font: { color: "white" },
                height: 400,
              }}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}
