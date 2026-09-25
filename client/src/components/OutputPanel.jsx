import React from "react";
import {
  formatMs,
  formatMemory,
  statusLabel,
  isErrorStatus,
} from "../utils/helpers";

export default function OutputPanel({
  activePanel,
  setActivePanel,
  stats,
  input,
  setInput,
  output,
  isLoading,
  handleClearOutput,
}) {
  return (
    <div className="io-panel">
      <div className="io-tabs">
        <div style={{ display: "flex", flex: 1 }}>
          <button
            className={`io-tab ${activePanel === "input" ? "active" : ""}`}
            onClick={() => setActivePanel("input")}
          >
            <span>Input</span>
          </button>
          <button
            className={`io-tab ${activePanel === "output" ? "active" : ""}`}
            onClick={() => setActivePanel("output")}
          >
            <span>Output</span>
            {stats && (
              <span
                className={`tab-status-pill ${
                  isErrorStatus(stats.status) ? "error" : "success"
                }`}
              >
                <span className="status-dot"></span>
                {statusLabel(stats.status)}
              </span>
            )}
          </button>
        </div>

        {/* IO Actions */}
        <div className="editor-actions" style={{ paddingLeft: "8px" }}>
          <button
            className="icon-btn"
            onClick={handleClearOutput}
            title="Clear Output"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      {activePanel === "input" ? (
        <div className="io-section">
          <textarea
            className="custom-input"
            placeholder="Enter custom input here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

      ) : (
        <div className="io-section" style={{ position: "relative" }}>
          {stats && (
            <div className="result-metrics">
              <div
                className={`metric-badge status-badge ${
                  isErrorStatus(stats.status) ? "error" : "success"
                }`}
              >
                <span className="status-dot"></span>
                {statusLabel(stats.status)}
              </div>
              {stats.compileTimeMs > 0 && (
                <div className="metric-item">
                  <span className="metric-label">Compile</span>
                  <span className="metric-value">
                    {formatMs(stats.compileTimeMs)}
                  </span>
                </div>
              )}
              <div className="metric-item">
                <span className="metric-label">Exec</span>
                <span className="metric-value">
                  {formatMs(stats.runTimeMs)}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Memory</span>
                <span className="metric-value">
                  {formatMemory(stats.memoryKb)}
                </span>
              </div>
              <div
                className="metric-item"
                title="Time taken inside the execution sandbox"
              >
                <span className="metric-label">Sandbox Time</span>
                <span className="metric-value">
                  {formatMs(stats.totalTimeMs)}
                </span>
              </div>
              <div
                className="metric-item"
                title="Includes network latency and server cold-starts"
              >
                <span className="metric-label">True Roundtrip</span>
                <span className="metric-value">
                  {formatMs(stats.clientRoundTripMs)}
                </span>
              </div>
              {stats.clientRoundTripMs - stats.totalTimeMs > 2000 && (
                <div
                  className="metric-item"
                  title="The server was sleeping and had to wake up"
                >
                  <span className="metric-label">Cold Start Delay</span>
                  <span className="metric-value warning">
                    {formatMs(stats.clientRoundTripMs - stats.totalTimeMs)}
                  </span>
                </div>
              )}
              {stats.exitCode != null && (
                <div className="metric-item">
                  <span className="metric-label">Exit Code</span>
                  <span
                    className={`metric-value ${
                      stats.exitCode === 0 ? "success" : "error"
                    }`}
                  >
                    {stats.exitCode}
                  </span>
                </div>
              )}
            </div>
          )}
          <textarea
            readOnly
            className={`output-terminal ${
              stats && isErrorStatus(stats.status) ? "error" : ""
            }`}
            value={
              isLoading
                ? "Running..."
                : output || "Click Run to execute code..."
            }
            spellCheck={false}
          />

        </div>
      )}
    </div>
  );
}
