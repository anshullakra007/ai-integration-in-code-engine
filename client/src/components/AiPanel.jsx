import React, { useState, useEffect, useRef } from "react";
import { askAssistant } from "../utils/gemini";
import "./AiPanel.css";

export default function AiPanel({ language, code, isVisible }) {
  const [messages, setMessages] = useState([
    { role: "model", content: "Hi! I am your AI coding assistant. Ask me anything about your code!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }
  }, [messages, isVisible]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    const context = { language, code };
    
    const geminiHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await askAssistant(geminiHistory, userMsg, context);
    
    setMessages([...newHistory, { role: "model", content: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} style={{ color: "var(--text-primary)", marginTop: index === 0 ? "0" : "12px", marginBottom: "8px", fontSize: "1.05rem", fontWeight: "600" }}>{line.replace('### ', '')}</h4>;
      }
      if (line.trim() === '') return <br key={index} />;
      
      const parts = line.split('`');
      return (
        <span key={index} style={{ display: "block", margin: "0 0 8px 0", lineHeight: "1.5" }}>
          {parts.map((part, i) => 
            i % 2 === 1 ? <code key={i} style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", padding: "2px 4px", borderRadius: "4px", color: "#e879f9", fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>{part}</code> : part
          )}
        </span>
      );
    });
  };

  if (!isVisible) return null;

  return (
    <div className="ai-panel">
      <div className="ai-chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`ai-message-wrapper ${msg.role}`}>
            <div className={`ai-message ${msg.role}`}>
              {msg.role === 'model' ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {renderMarkdown(msg.content)}
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-message-wrapper model">
            <div className="ai-message model loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="ai-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your code..."
          className="ai-textarea"
          rows={1}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="ai-send-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}
