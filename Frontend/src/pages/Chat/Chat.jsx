import React, { useState } from "react";
import MapplsMap from "../../components/MapplsMap";
import "./Chat.css";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // Call your real RAG backend
  async function fetchRagData(userQuery) {
    const resp = await fetch(
      `${import.meta.env.VITE_ARGO_BACKEND_BASE_URL}/query/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      }
    );

    if (!resp.ok) throw new Error("API request failed");
    return await resp.json();
  }

  // Handle chat input
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setError(null);
    setLoading(true);
    setShowMap(false);

    try {
      const resp = await fetchRagData(query.trim());

      const idx = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", stage: "answer", text: "", sql: "", resp: null },
      ]);

      // Decide: use RAG or fallback to SQL
      const finalAnswer =
        resp?.rag_output && resp.rag_output.trim().length > 0
          ? resp.rag_output
          : "RAG retrieval failed. Showing SQL result instead.";
      const finalSql = resp?.sql_query || "";

      // Typing animation for answer
      let answerSoFar = "";
      const words = finalAnswer.split(" ");
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

          // Then animate SQL if available
          let sqlSoFar = "";
          const sqlChars = finalSql.split("");
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

              setMessages((prev) =>
                prev.map((m, id) =>
                  id === idx
                    ? {
                        role: "assistant",
                        stage: "done",
                        text: finalAnswer,
                        sql: finalSql,
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
      console.error(err);
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
    if (!resp?.sql_rows?.length) return;
    const headers = Object.keys(resp.sql_rows[0]);
    const rows = resp.sql_rows.map((r) => headers.map((h) => r[h]));
    const csv = [headers.join(","), ...rows.map((a) => a.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sql_results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTable = (resp) => {
    if (!resp?.sql_rows?.length) return null;
    const headers = Object.keys(resp.sql_rows[0]);
    return (
      <div className="mt-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">
            Showing {resp.sql_rows.length} SQL results
          </div>
          <button
            onClick={() => downloadCsv(resp)}
            className="px-3 py-1.5 rounded-xl text-sm bg-gray-800 text-white hover:bg-gray-700"
          >
            Download CSV
          </button>
        </div>

        <div className="border border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-80 overflow-auto chat-scroll-area">
            <table className="min-w-full text-sm text-white">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr className="text-left">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resp.sql_rows.map((row, i) => (
                  <tr key={i} className="odd:bg-gray-900 even:bg-gray-800">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex flex-col text-white">
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl w-full mx-auto space-y-6 pb-32">
        {messages.length === 0 && !loading && !error && (
          <div className="h-full mt-56 flex flex-col items-center justify-center text-center space-y-3">
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
              <div>{m.text}</div>
              {m.sql && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">SQL query</div>
                  <pre className="bg-[#0d1b2a] p-4 rounded-xl overflow-auto text-sm">
                    <code>{m.sql}</code>
                  </pre>
                </div>
              )}
              {renderTable(m.resp)}
              {resp?.sql_rows?.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowMap((s) => !s)}
                    className="px-3 py-1.5 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {showMap ? "Hide Map" : "Show Map"}
                  </button>
                  {showMap && (
                    <div className="mt-4 h-[420px] rounded-xl overflow-hidden">
                      <MapplsMap
                        results={m.resp.sql_rows.map((r, i) => ({
                          id: i + 1,
                          lat: r.latitude,
                          lon: r.longitude,
                          ...r,
                        }))}
                      />
                    </div>
                  )}
                </div>
              )}
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
      <form onSubmit={handleAsk} className="chat-form">
        <div className="chat-input-wrapper">
          <textarea
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
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
                  e.target.style.height = "auto";
                }
              }
            }}
            placeholder="Type your question..."
            rows={1}
            className="chat-textarea"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="chat-send-btn"
          >
            <span className="chat-send-icon">➤</span>
          </button>
        </div>
      </form>
    </div>
  );
}
