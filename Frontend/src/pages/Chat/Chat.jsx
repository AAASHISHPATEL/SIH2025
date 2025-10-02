import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MapplsMap from "../../components/MapplsMap";
import "./Chat.css";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // ✅ Extract lat/lon pairs from RAG answers
  function extractLocations(answerText) {
    if (!answerText || typeof answerText !== "string") return [];
    const regex = /Location:\s*\(([-+]?\d*\.?\d+),\s*([-+]?\d*\.?\d+)\)/g;
    let match;
    const results = [];
    while ((match = regex.exec(answerText)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lon)) {
        results.push({
          lat,
          lon,
          label: `Lat: ${lat}, Lon: ${lon}`,
        });
      }
    }
    console.log("Extracted locations:", results);
    return results;
    
  }

  // ✅ Call real RAG backend
  const fetchRagData = useCallback(async (userQuery) => {
    const resp = await fetch(
      "https://argo-backend-service.onrender.com/query/ask/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(
        `API request failed with status ${resp.status}: ${errorText}`
      );
    }
    const data = await resp.json();
    console.log("RAG response:", data);
    return data;
  }, []);

  // ✅ Handle chat input
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query.trim();
    setMessages((prev) => [...prev, { role: "user", text: userQuery }]);
    setError(null);
    setLoading(true);
    setShowMap(false);

    const newAssistantMessageIndex = messages.length + 1;
    setQuery("");

    try {
      const resp = await fetchRagData(userQuery);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", stage: "answer", text: "", sql: "", resp: null },
      ]);

      const finalAnswer =
        resp?.answer && resp.answer.trim().length > 0
          ? resp.answer
          : "RAG retrieval failed. Showing SQL result instead.";
      const finalSql = resp?.sql_query || "";

      // --- Typing animation for answer ---
      let answerSoFar = "";
      const words = finalAnswer.split(" ");
      let i = 0;

      const answerInterval = setInterval(() => {
        if (i < words.length) {
          answerSoFar += words[i] + " ";
          setMessages((prev) =>
            prev.map((m, id) =>
              id === newAssistantMessageIndex ? { ...m, text: answerSoFar } : m
            )
          );
          i++;
        } else {
          clearInterval(answerInterval);

          // --- Animate SQL ---
          let sqlSoFar = "";
          const sqlChars = finalSql.split("");
          let j = 0;

          setMessages((prev) =>
            prev.map((m, id) =>
              id === newAssistantMessageIndex ? { ...m, stage: "sql" } : m
            )
          );

          const sqlInterval = setInterval(() => {
            if (j < sqlChars.length) {
              sqlSoFar += sqlChars[j];
              setMessages((prev) =>
                prev.map((m, id) =>
                  id === newAssistantMessageIndex ? { ...m, sql: sqlSoFar } : m
                )
              );
              j++;
            } else {
              clearInterval(sqlInterval);

              // --- Final update with extracted locations ---
              setMessages((prev) =>
                prev.map((m, id) =>
                  id === newAssistantMessageIndex
                    ? {
                        role: "assistant",
                        stage: "done",
                        text: finalAnswer,
                        sql: finalSql,
                        resp: {
                          ...resp,
                          rag_locations: extractLocations(finalAnswer),
                        },
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
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CSV Download
  const downloadCsv = (resp) => {
    if (!resp?.sql_rows?.length) return;
    const headers = Object.keys(resp.sql_rows[0]);

    const rows = resp.sql_rows.map((r) =>
      headers
        .map((h) => {
          const val = r[h] == null ? "" : String(r[h]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const BOM = "\uFEFF";
    const csv = [BOM, headers.map((h) => `"${h}"`).join(","), ...rows].join(
      "\n"
    );

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

  // ✅ Render SQL Table
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
                        {row[h] == null ? "" : row[h]}
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
              {/* ✅ Markdown rendering for rich answers */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-2 leading-relaxed" {...props} />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="bg-gray-800 px-1 rounded" {...props} />
                    ) : (
                      <pre className="bg-gray-900 p-3 rounded-xl overflow-x-auto text-sm">
                        <code {...props} />
                      </pre>
                    ),
                }}
              >
                {m.text}
              </ReactMarkdown>

              {m.sql && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">SQL query</div>
                  <pre className="bg-[#0d1b2a] p-4 rounded-xl overflow-auto text-sm">
                    <code>{m.sql}</code>
                  </pre>
                </div>
              )}

              {renderTable(m.resp)}

              {/* ✅ Show map if SQL rows OR RAG locations exist */}
              {(m.resp?.sql_rows?.length > 0 ||
                (m.resp?.rag_locations && m.resp.rag_locations.length > 0)) && (
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
                        results={
                          m.resp.sql_rows?.length > 0
                            ? m.resp.sql_rows.map((r, i) => ({
                                id: i + 1,
                                lat: r.latitude,
                                lon: r.longitude,
                                ...r,
                              }))
                            : m.resp.rag_locations.map((loc, i) => ({
                                id: i + 1,
                                lat: loc.lat,
                                lon: loc.lon,
                                file: loc.label,
                              }))
                        }
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
