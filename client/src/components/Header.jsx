import React, { useState } from "react";

export default function Header({
  language,
  handleLanguageSelect,
  isLoading,
  handleRun,
  handleRunEdgeCases,
  isBatchLoading,
  setIsStoryOpen,
  theme,
  setTheme,
}) {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const onLanguageSelect = (lang) => {
    handleLanguageSelect(lang);
    setIsLangDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-title">CodeEngine</span>
      </div>
      <div className="controls">
        <div className="custom-dropdown-container">
          <button
            className="lang-select-btn"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          >
            <span className={`lang-dot ${language}`}></span>
            <span className="lang-btn-text">
              {language === "cpp"
                ? "C++ (GCC 17)"
                : language === "java"
                  ? "Java (JDK 21)"
                  : "Python 3.11"}
            </span>
            <svg
              className={`select-chevron ${isLangDropdownOpen ? "open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isLangDropdownOpen && (
            <>
              <div
                className="dropdown-overlay"
                onClick={() => setIsLangDropdownOpen(false)}
              ></div>
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${language === "cpp" ? "active" : ""}`}
                  onClick={() => onLanguageSelect("cpp")}
                >
                  <span className="lang-dot cpp"></span> C++ (GCC 17)
                </button>
                <button
                  className={`dropdown-item ${language === "java" ? "active" : ""}`}
                  onClick={() => onLanguageSelect("java")}
                >
                  <span className="lang-dot java"></span> Java (JDK 21)
                </button>
                <button
                  className={`dropdown-item ${language === "python" ? "active" : ""}`}
                  onClick={() => onLanguageSelect("python")}
                >
                  <span className="lang-dot python"></span> Python 3.11
                </button>
              </div>
            </>
          )}
        </div>

        <button
          className="run-btn"
          onClick={handleRun}
          disabled={isLoading}
          title="Run Code (⌘+Enter)"
        >
          {isLoading ? (
            <>
              <svg
                className="spinner"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>{" "}
              <span>Running...</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>{" "}
              <span>Run</span>
            </>
          )}
        </button>

        <button
          className="run-btn edge-case-btn btn-magic"
          onClick={handleRunEdgeCases}
          disabled={isLoading || isBatchLoading}
          title="Generate & Run Edge Cases"
          style={{ marginLeft: "8px" }}
        >
          {isBatchLoading ? (
            <>
              <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>{" "}
              <span>Running Batch...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>{" "}
              <span>Edge Cases</span>
            </>
          )}
        </button>

        <button
          className="story-mode-btn"
          onClick={() => setIsStoryOpen(true)}
          title="Inspect CodeEngine's Execution Pipeline"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>Architecture</span>
        </button>

        <button
          className="icon-btn theme-btn"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
