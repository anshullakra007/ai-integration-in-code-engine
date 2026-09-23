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
  batchResult,
  onAutoHeal,
  isAutoHealLoading,
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
          <button
            className={`io-tab ${activePanel === "testcases" ? "active" : ""}`}
            onClick={() => setActivePanel("testcases")}
          >
            <span>Test Cases</span>
            {batchResult && (
              <span className={`tab-status-pill ${batchResult.passedTests === batchResult.totalTests ? "success" : "error"}`}>
                {batchResult.passedTests}/{batchResult.totalTests}
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
      ) : activePanel === "testcases" ? (
        <div className="io-section" style={{ overflowY: "auto" }}>
          {batchResult ? (
            <div className="batch-results">
              <div className="batch-header" style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                <h3 style={{ margin: "0 0 8px 0" }}>{batchResult.summary}</h3>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <span>Passed: {batchResult.passedTests} / {batchResult.totalTests}</span>
                  <span>Batch Time: {formatMs(batchResult.totalBatchTimeMs)}</span>
                </div>
              </div>
              
              {batchResult.testCaseResults && batchResult.testCaseResults.map((res, i) => (
                <div key={i} className="testcase-card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", borderRadius: "12px", marginBottom: "12px", animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong>Test Case #{i + 1} {i === 0 ? "(Base)" : "(AI Generated)"}</strong>
                    <span className={`status-badge ${isErrorStatus(res.status) ? "error" : "success"}`} style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                      {statusLabel(res.status)}
                    </span>
                  </div>
                  
                  {res.aiFeedback && (
                    <div style={{ margin: "8px 0", padding: "8px", background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "4px", fontSize: "13px" }}>
                      <strong>AI Auto-Healed: </strong> {res.aiFeedback}
                    </div>
                  )}
                  
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    <div>Exit Code: {res.exitCode} | Time: {formatMs(res.runTimeMs)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>
              Run Edge Cases to see results here.
            </div>
          )}
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
          {stats && isErrorStatus(stats.status) && (
            <div style={{ position: "absolute", bottom: "24px", right: "24px", zIndex: 10 }}>
              <button 
                className="run-btn btn-magic" 
                onClick={onAutoHeal} 
                disabled={isAutoHealLoading}
                style={{ padding: "0 20px" }}
              >
                {isAutoHealLoading ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                    Healing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Auto-Heal with AI ✨
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
