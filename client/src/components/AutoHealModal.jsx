import React from "react";
import { DiffEditor } from "@monaco-editor/react";

export default function AutoHealModal({
  isOpen,
  onClose,
  originalCode,
  healedCode,
  language,
  theme,
  onAccept,
  aiFeedback,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content auto-heal-modal">
        <div className="modal-header">
          <h2>Auto-Heal Verification</h2>
          <button className="icon-btn close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {aiFeedback && (
          <div className="ai-analysis-panel">
            <h3 style={{ color: "#ff007f", marginBottom: "16px", fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              AI Error Analysis
            </h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "var(--text-secondary)" }}>
              {aiFeedback}
            </div>
          </div>
        )}

        <div className="diff-editor-container" style={{ flex: 1, position: "relative" }}>
          <DiffEditor
            original={originalCode}
            modified={healedCode}
            language={language === "cpp" ? "cpp" : language}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{
              renderSideBySide: true,
              readOnly: true,
              minimap: { enabled: false },
              padding: { top: 16 }
            }}
          />
        </div>
        
        <div className="modal-footer">
          <button className="icon-btn" onClick={onClose}>
            Discard
          </button>
          <button className="run-btn btn-magic" onClick={() => { onAccept(healedCode); onClose(); }}>
            Accept Fix
          </button>
        </div>
      </div>
    </div>
  );
}
