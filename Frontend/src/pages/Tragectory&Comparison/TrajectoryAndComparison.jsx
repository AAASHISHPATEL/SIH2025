import { useState, useEffect } from "react";
import Select from "react-select";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TrajectoryAndComparison.css";
import MappleMapForTraj from "../../components/MappleMapForTraj"; // ✅ Your Mappls component

// ---- Mock Float Options ----
const MOCK_FLOAT_OPTIONS = [
  { value: "R13857_001", label: "R13857_001" },
  { value: "R13857_002", label: "R13857_002" },
  { value: "R13857_003", label: "R13857_003" },
  { value: "R13857_004", label: "R13857_004" },
  { value: "R13857_005", label: "R13857_005" },
  { value: "R13857_006", label: "R13857_006" },
  { value: "R13857_007", label: "R13857_007" },
  { value: "R13857_008", label: "R13857_008" },
];

// ---- Generate Dummy Data ----
// ---- Generate Dummy Data ----
const generateDummyProfile = (id, indexOffset = 0) => {
  const depth = Array.from({ length: 20 }, (_, i) => i * 50 + 10);
  const temp = depth.map((d) => 25 - d * 0.015 + Math.random());
  const pressure = depth.map((d) => d * 1.01);
  const salinity = depth.map((d) => 35 + Math.random());

  // 🔧 Each float starts from a different base position
  const baseLat = 5 + indexOffset * 2;   // offset each float in latitude
  const baseLng = -40 - indexOffset * 5; // offset each float in longitude

  // 🔧 Make trajectory zig-zag by adding noise
  const trajectory = depth.map((d, i) => ({
    lat: baseLat + i * 0.2 + (Math.random() - 0.5) * 0.5,
    lng: baseLng - i * 0.2 + (Math.random() - 0.5) * 0.5,
    date: new Date(1997, 9, 14 + i, 12, 0, 0),
  }));

  return {
    metadata: {
      float_id: id,
      file: `aoml/13857/profiles/${id}.nc`,
      date: "1997-10-14 18:39:35",
      date_update: "2018-10-11 18:05:22",
      latitude: baseLat,
      longitude: baseLng,
      ocean: "A",
      profiler_type: 845,
      institution: "AO",
    },
    profile: { depth, temp, pressure, salinity, date: new Date(1997, 9, 14) },
    trajectory,
  };
};


export default function TrajectoryAndComparison() {
  const [selectedFloats, setSelectedFloats] = useState([]);
  const [floatData, setFloatData] = useState({});
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Load dummy data when floats selected
  useEffect(() => {
    const newData = {};
    selectedFloats.forEach(({ value }, idx) => {
      newData[value] = generateDummyProfile(value, idx); // pass idx for offset
    });
    setFloatData(newData);
  }, [selectedFloats]);


  // Temperature vs Depth Chart
  const tempVsDepthOptions = {
    chart: { backgroundColor: "#1f2937" },
    title: { text: "Temperature vs Depth", style: { color: "white" } },
    xAxis: {
      title: { text: "Temperature" },
      labels: { style: { color: "white" } },
    },
    yAxis: {
      title: { text: "Depth" },
      reversed: true,
      labels: { style: { color: "white" } },
    },
    legend: { itemStyle: { color: "white" } },
    series: selectedFloats.map((f, i) => ({
      name: f.value,
      data: floatData[f.value]?.profile?.depth.map((d, idx) => [
        floatData[f.value].profile.temp[idx],
        d,
      ]),
    })),
  };

  // Pressure vs Depth Chart
  const presVsDepthOptions = {
    chart: { backgroundColor: "#1f2937" },
    title: { text: "Pressure vs Depth", style: { color: "white" } },
    xAxis: {
      title: { text: "Pressure" },
      labels: { style: { color: "white" } },
    },
    yAxis: {
      title: { text: "Depth" },
      reversed: true,
      labels: { style: { color: "white" } },
    },
    legend: { itemStyle: { color: "white" } },
    series: selectedFloats.map((f) => ({
      name: f.value,
      data: floatData[f.value]?.profile?.depth.map((d, idx) => [
        floatData[f.value].profile.pressure[idx],
        d,
      ]),
    })),
  };

  // Temperature vs Time Chart (Representative)
  const tempVsTimeOptions = {
    chart: { backgroundColor: "#1f2937" },
    title: { text: "Temperature vs Time", style: { color: "white" } },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "white" } },
    },
    yAxis: {
      title: { text: "Temperature" },
      labels: { style: { color: "white" } },
    },
    legend: { itemStyle: { color: "white" } },
    series: selectedFloats.map((f) => {
      const traj = floatData[f.value]?.trajectory || [];
      const filtered = traj.filter(
        (t) =>
          (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate)
      );
      return {
        name: f.value,
        data: filtered.map((t) => [t.date.getTime(), 20 + Math.random() * 5]),
      };
    }),
  };

  return (
    <div className="tac-container">
      <div className="max-w-7xl mx-auto">
        <h1 className="tac-title">Profile & Index metadata comparison</h1>

        {/* Float Selector */}
        <div className="tac-card">
          <label className="tac-label">Select floats for comparison</label>
          <Select
            classNamePrefix="tac-select"
            isMulti
            options={MOCK_FLOAT_OPTIONS}
            value={selectedFloats}
            onChange={(opts) => setSelectedFloats(opts || [])}
            closeMenuOnSelect={false}
          />
        </div>

        {/* Metadata Table */}
        {selectedFloats.length > 0 && (
          <div className="tac-card">
            <h2 className="tac-subtitle">Index metadata for selected floats</h2>
            <table className="tac-table">
              <thead>
                <tr>
                  <th>float_id</th>
                  <th>file</th>
                  <th>date</th>
                  <th>latitude</th>
                  <th>longitude</th>
                  <th>institution</th>
                </tr>
              </thead>
              <tbody>
                {selectedFloats.map((f) => {
                  const m = floatData[f.value]?.metadata;
                  return (
                    <tr key={f.value}>
                      <td>{m?.float_id}</td>
                      <td>{m?.file}</td>
                      <td>{m?.date}</td>
                      <td>{m?.latitude}</td>
                      <td>{m?.longitude}</td>
                      <td>{m?.institution}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Map Section */}
        <div className="tac-card">
          <h2 className="tac-subtitle">Trajectories (Mappls)</h2>
          <div className="tac-map-wrapper">
            <MappleMapForTraj
              trajectories={selectedFloats.map((f, idx) => {
                const traj = floatData[f.value]?.trajectory || [];
                return {
                  float_id: f.value,
                  color: [
                    "#e11d48",
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                  ][idx % 5],
                  points: traj.map((p, tIdx) => ({
                    id: `${f.value}_${tIdx}`,
                    lat: p.lat,
                    lng: p.lng ?? p.lon,
                    file: floatData[f.value].metadata.file,
                    institution: floatData[f.value].metadata.institution,
                    date: p.date,
                  })),
                };
              })}
            />
          </div>
        </div>

        {/* Charts */}
        {selectedFloats.length > 0 && (
          <div className="tac-card">
            <div className="tac-charts-grid">
              <HighchartsReact
                highcharts={Highcharts}
                options={tempVsDepthOptions}
              />
              <HighchartsReact
                highcharts={Highcharts}
                options={presVsDepthOptions}
              />
            </div>
          </div>
        )}

        {/* Temp vs Time */}
        {selectedFloats.length > 0 && (
          <div className="tac-card">
            <h2 className="tac-subtitle">Temperature vs Time</h2>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable
              className="tac-input"
            />
            <HighchartsReact
              highcharts={Highcharts}
              options={tempVsTimeOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
