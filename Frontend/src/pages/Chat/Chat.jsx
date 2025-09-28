import React, { useState } from "react";
import MapplsMap from "../../components/MapplsMap"; // ✅ using Mappls now

export default function Chat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // Mock API
  async function fetchArgoData(userQuery) {
    const start_time = "2023-01-01T00:00:00Z";
    const end_time = "2023-12-31T23:59:59Z";
    const index_rows = [
      {
        file: "aoml/5905765/profiles/D5905765_268.nc",
        date: "20231231235828",
        latitude: -3.506,
        longitude: -172.287,
        ocean: "P",
        profiler_type: 862,
        institution: "AO",
        date_update: "20240828201558",
      },
    ];
    return {
      answer:
        "There are multiple Argo floats in both the Indian and Pacific Oceans in 2023. The provided data shows examples in both oceans; the full count requires querying the complete dataset.",
      sql: `SELECT COUNT(*), *\nFROM argo_data\nWHERE ocean IN ('I','P')\n  AND date >= '${start_time}'\n  AND date <= '${end_time}';`,
      start_time,
      end_time,
      total: 500,
      index_rows,
    };
  }

  // Handle question
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Push user message
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setError(null);
    setLoading(true);
    setShowMap(false);

    try {
      const resp = await fetchArgoData(query.trim());

      // Add placeholder assistant message
      const idx = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", stage: "answer", text: "", sql: "", resp: null },
      ]);

      // Step 1: Stream answer
      let answerSoFar = "";
      const words = resp.answer.split(" ");
      let i = 0;

      const answerInterval = setInterval(() => {
        if (i < words.length) {
          answerSoFar += words[i] + " ";
          setMessages((prev) =>
            prev.map((m, id) => (id === idx ? { ...m, text: answerSoFar } : m))
          );
          i++;
        } else {
          clearInterval(answerInterval);

          // Step 2: Stream SQL query
          let sqlSoFar = "";
          const sqlChars = resp.sql.split("");
          let j = 0;
          setMessages((prev) =>
            prev.map((m, id) => (id === idx ? { ...m, stage: "sql" } : m))
          );

          const sqlInterval = setInterval(() => {
            if (j < sqlChars.length) {
              sqlSoFar += sqlChars[j];
              setMessages((prev) =>
                prev.map((m, id) => (id === idx ? { ...m, sql: sqlSoFar } : m))
              );
              j++;
            } else {
              clearInterval(sqlInterval);

              // Step 3: Show table & map instantly
              setMessages((prev) =>
                prev.map((m, id) =>
                  id === idx
                    ? {
                        role: "assistant",
                        stage: "done",
                        text: resp.answer,
                        sql: resp.sql,
                        resp,
                      }
                    : m
                )
              );
            }
          }, 20);
        }
      }, 50);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  // Helpers
  const splitDateTime = (raw) => {
    if (!raw) return { d: "", t: "" };
    const iso = /T/.test(raw)
      ? raw
      : `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(
          6,
          8
        )}T${raw.substring(8, 10)}:${raw.substring(10, 12)}:${raw.substring(
          12,
          14
        )}Z`;
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return { d: raw, t: "" };
    const pad = (n) => n.toString().padStart(2, "0");
    return {
      d: `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(
        dt.getUTCDate()
      )}`,
      t: `${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:${pad(
        dt.getUTCSeconds()
      )}Z`,
    };
  };

  const downloadCsv = (resp) => {
    if (!resp?.index_rows?.length) return;
    const headers = [
      "file",
      "date",
      "time",
      "latitude",
      "longitude",
      "ocean",
      "profiler_type",
      "institution",
      "date_update",
      "time_update",
    ];
    const rows = resp.index_rows.map((r) => {
      const d1 = splitDateTime(r.date);
      const d2 = splitDateTime(r.date_update);
      return [
        r.file,
        d1.d,
        d1.t,
        r.latitude,
        r.longitude,
        r.ocean,
        r.profiler_type,
        r.institution,
        d2.d,
        d2.t,
      ];
    });
    const csv = [headers.join(","), ...rows.map((a) => a.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index_rows.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTable = (resp) => {
    if (!resp?.index_rows?.length) return null;
    return (
      <div className="mt-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">
            Showing {resp.index_rows.length} of {resp.total} results
          </div>
          <button
            onClick={() => downloadCsv(resp)}
            className="px-3 py-1.5 rounded-xl text-sm bg-gray-800 text-white hover:bg-gray-700"
          >
            Download CSV
          </button>
        </div>
        <div className="border border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full text-sm text-white">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="px-4 py-2">File</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Lat</th>
                  <th className="px-4 py-2">Lon</th>
                  <th className="px-4 py-2">Ocean</th>
                  <th className="px-4 py-2">Profiler</th>
                  <th className="px-4 py-2">Institution</th>
                </tr>
              </thead>
              <tbody>
                {resp.index_rows.map((r, i) => {
                  const d1 = splitDateTime(r.date);
                  return (
                    <tr key={i} className="odd:bg-gray-900 even:bg-gray-800">
                      <td className="px-4 py-2">{r.file}</td>
                      <td className="px-4 py-2">{d1.d}</td>
                      <td className="px-4 py-2">{d1.t}</td>
                      <td className="px-4 py-2">{r.latitude}</td>
                      <td className="px-4 py-2">{r.longitude}</td>
                      <td className="px-4 py-2">{r.ocean}</td>
                      <td className="px-4 py-2">{r.profiler_type}</td>
                      <td className="px-4 py-2">{r.institution}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex flex-col text-white">
      <main className="flex-1  overflow-y-auto px-4 py-6 max-w-5xl w-full mx-auto space-y-6 pb-32">
        {messages.length === 0 && !loading && !error && (
          <div className="h-full mt-56   flex flex-col items-center justify-center text-center space-y-3">
            <h1 className="text-5xl font-bold mb-2 opacity-0 animate-fadeUp [animation-delay:0.2s]">
              Welcome to <span className="text-blue-400">FloatChat</span>
            </h1>
            <p className="text-gray-400 text-lg opacity-0 animate-fadeUp [animation-delay:0.6s]">
              Ask me about ARGO floats data
            </p>
          </div>
        )}

        {messages.map((m, idx) =>
          m.role === "user" ? (
            <div key={idx} className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-lg whitespace-pre-wrap break-words">
                {m.text}
              </div>
            </div>
          ) : m.stage !== "done" ? (
            <div
              key={idx}
              className="bg-[#1b263b] border border-gray-700 rounded-2xl p-5 whitespace-pre-wrap"
            >
              {m.stage === "answer" && (
                <>
                  {m.text} <span className="blinking-cursor">|</span>
                </>
              )}
              {m.stage === "sql" && (
                <div>
                  <div>{m.text}</div>
                  <pre className="bg-[#0d1b2a] p-4 rounded-xl text-sm">
                    <code>{m.sql}</code>
                  </pre>
                  <span className="blinking-cursor">|</span>
                </div>
              )}
            </div>
          ) : (
            <div
              key={idx}
              className="bg-[#1b263b] border border-gray-700 rounded-2xl p-5 space-y-4"
            >
              <div>{m.resp.answer}</div>
              <div>
                <div className="text-sm text-gray-400 mb-2">SQL query</div>
                <pre className="bg-[#0d1b2a] p-4 rounded-xl overflow-auto text-sm">
                  <code>{m.resp.sql}</code>
                </pre>
              </div>
              {renderTable(m.resp)}
              <div>
                <button
                  onClick={() => setShowMap((s) => !s)}
                  className="px-3 py-1.5 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  {showMap ? "Hide Map" : "Show Map"}
                </button>
                {showMap && m.resp.index_rows?.length > 0 && (
                  <div className="mt-4 h-[420px] rounded-xl overflow-hidden">
                    <MapplsMap
                      results={m.resp.index_rows.map((r, i) => ({
                        id: i + 1,
                        lat: r.latitude,
                        lon: r.longitude,
                        file: r.file,
                        date: r.date,
                        institution: r.institution,
                        ocean: r.ocean,
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {loading && <div className="text-gray-400">Thinking…</div>}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400 text-red-200">
            {error}
          </div>
        )}
      </main>

      {/* Sticky Input */}
      <form
        onSubmit={handleAsk}
        className="sticky bottom-0 w-full bg-[#0d1b2a]  border-gray-700 p-4 flex justify-center bg-transparent z-10"
      >
        <div className="w-full max-w-2xl relative rounded-2xl border border-gray-700 bg-[#1b263b] p-3">
          <textarea
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);

              // Auto resize
              const textarea = e.target;
              textarea.style.height = "auto";
              textarea.style.height = `${textarea.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (query.trim()) {
                  handleAsk(e);
                  setQuery("");
                  e.target.style.height = "auto"; // reset
                }
              }
            }}
            placeholder="Type your question... "
            rows={1}
            className="w-full pr-16 outline-none px-3 py-2 bg-transparent text-white placeholder-gray-400 resize-none overflow-hidden whitespace-pre-wrap"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "…" : "Ask"}
          </button>
        </div>
      </form>
    </div>
  );
}
