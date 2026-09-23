import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { BOILERPLATES } from "../utils/constants";

export default function EditorPanel({
  language,
  code,
  setCode,
  theme,
  fontSize,
  handleZoomIn,
  handleZoomOut,
  handleDownload,
  handleCopy,
  copied,
  setCursor,
  leftWidth,
}) {
  const editorRef = useRef(null);
  const debounceTimer = useRef(null);
  const [localCode, setLocalCode] = useState(code);

  // Sync global code to local code (e.g. after Auto-Heal or reset)
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(({ position }) => {
      setCursor({ line: position.lineNumber, col: position.column });
    });
  };

  const handleEditorChange = (value) => {
    const val = value ?? "";
    setLocalCode(val);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setCode(val);
    }, 150);
  };

  return (
    <div
      className="editor-panel"
      style={{ width: `${leftWidth}%`, flex: "none" }}
    >
      <div className="panel-header-row">
        <div className="editor-tab active">
          <span className={`lang-dot ${language}`}></span>
          <span className="file-name">
            main.
            {language === "cpp" ? "cpp" : language === "java" ? "java" : "py"}
          </span>
          <span className="file-meta">UTF-8</span>
        </div>
        <div className="editor-actions">
          <div className="zoom-controls">
            <button onClick={handleZoomOut} title="Decrease Font Size">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="zoom-divider"></div>
            <button onClick={handleZoomIn} title="Increase Font Size">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <button
            className="icon-btn"
            onClick={() => setCode(BOILERPLATES[language])}
            title="Reset to Boilerplate"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>{" "}
            Reset
          </button>
          <button
            className="icon-btn"
            onClick={handleDownload}
            title="Download Source File"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>{" "}
            Save
          </button>
          <button
            className="icon-btn copy-btn"
            onClick={handleCopy}
            title="Copy Code to Clipboard"
          >
            {copied ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>{" "}
                <span className="copied-text">Copied</span>
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>{" "}
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <Editor
        height="100%"
        language={language === "cpp" ? "cpp" : language}
        theme={theme === "dark" ? "vs-dark" : "light"}
        value={localCode}
        onMount={handleEditorMount}
        onChange={handleEditorChange}
        options={{
          fontSize,
          lineNumbers: "on",
          minimap: { enabled: true },
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          fontFamily: "'JetBrains Mono', monospace",
          renderWhitespace: "selection",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
