import { useState, useEffect, useCallback } from "react";
import "./App.css";
import ArchitectureStory from "./components/ArchitectureStory";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import OutputPanel from "./components/OutputPanel";
import AiPanel from "./components/AiPanel";
import { BOILERPLATES, LANGUAGE_LABELS } from "./utils/constants";
import { isErrorStatus } from "./utils/helpers";

function App() {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "cpp",
  );
  const [code, setCode] = useState(() => {
    const lang = localStorage.getItem("language") || "cpp";
    return localStorage.getItem(`savedCode_${lang}`) || BOILERPLATES[lang];
  });
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activePanel, setActivePanel] = useState("output");
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(
    parseInt(localStorage.getItem("fontSize"), 10) || 14,
  );
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Resizing State
  const [leftWidth, setLeftWidth] = useState(55);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem(`savedCode_${language}`, code);
    localStorage.setItem("language", language);
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light",
    );
  }, [code, language, fontSize, theme]);

  const handleRun = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setOutput("");
    setStats(null);
    setActivePanel("output");

    const clientStart = performance.now();

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input }),
      });

      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        throw new Error(
          `Server error (${response.status}): ${textResponse || "Empty response from execution server"}`,
        );
      }

      const clientRoundTrip = Math.round(performance.now() - clientStart);

      const displayText = isErrorStatus(result.status)
        ? result.error || result.output || "Execution failed."
        : result.output || "(no output)";

      setOutput(displayText);
      setStats({
        status: result.status,
        compileTimeMs: result.compileTimeMs,
        runTimeMs: result.runTimeMs,
        totalTimeMs: result.totalTimeMs,
        memoryKb: result.memoryKb,
        exitCode: result.exitCode,
        clientRoundTripMs: clientRoundTrip,
      });
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setStats({
        status: "ERROR",
        clientRoundTripMs: Math.round(performance.now() - clientStart),
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language, code, input]);



  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 30 && newWidth < 85) {
        setLeftWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      // Disable text selection during drag
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleLanguageSelect = (newLang) => {
    setLanguage(newLang);
    setCode(
      localStorage.getItem(`savedCode_${newLang}`) || BOILERPLATES[newLang],
    );
    setStats(null);
    setOutput("");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    const ext =
      language === "cpp" ? "cpp" : language === "java" ? "java" : "py";
    element.download = `solution.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleZoomIn = () => setFontSize((f) => Math.min(f + 2, 32));
  const handleZoomOut = () => setFontSize((f) => Math.max(f - 2, 8));

  const handleClearOutput = () => {
    setOutput("");
    setStats(null);
  };

  return (
    <div className="app-container">
      <Header
        language={language}
        handleLanguageSelect={handleLanguageSelect}
        isLoading={isLoading}
        handleRun={handleRun}
        setIsStoryOpen={setIsStoryOpen}
        setIsAiPanelOpen={setIsAiPanelOpen}
        theme={theme}
        setTheme={setTheme}
      />

      <div className={`workspace ${isDragging ? "resizing" : ""}`}>
        <EditorPanel
          language={language}
          code={code}
          setCode={setCode}
          theme={theme}
          fontSize={fontSize}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleDownload={handleDownload}
          handleCopy={handleCopy}
          copied={copied}
          setCursor={setCursor}
          leftWidth={leftWidth}
        />

        {/* The Invisible Magnetic Gutter */}
        <div
          className={`resize-gutter ${isDragging ? "dragging" : ""}`}
          onMouseDown={() => setIsDragging(true)}
          onDoubleClick={() => setLeftWidth(60)}
          title="Drag to resize, double click to reset"
        >
          <div className="gutter-pill"></div>
        </div>

        <OutputPanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          stats={stats}
          input={input}
          setInput={setInput}
          output={output}
          isLoading={isLoading}
          handleClearOutput={handleClearOutput}
        />
        
        {isAiPanelOpen && (
          <div className="ai-drawer" style={{ width: '400px', flexShrink: 0, borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-blue)' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                AI Assistant
              </h3>
              <button onClick={() => setIsAiPanelOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AiPanel language={language} code={code} output={output} stats={stats} isVisible={true} />
            </div>
          </div>
        )}
      </div>

      <footer className="status-bar">
        <div className="status-left">
          <span className="status-item cluster-status">
            <span className="status-dot online"></span>
            <span>Sandbox Ready</span>
          </span>
          <span className="status-divider"></span>
          <span className="status-item">
            Ln {cursor.line}, Col {cursor.col}
          </span>
        </div>
        <div className="status-right">
          <span className="status-item">{LANGUAGE_LABELS[language]}</span>
          <span className="status-divider"></span>
          <span className="status-item">UTF-8</span>
          <span className="status-item">Spaces: 4</span>
        </div>
      </footer>

      <ArchitectureStory
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        selectedLanguage={language}
      />
    </div>
  );
}

export default App;
