import React, { useState } from "react";
import { FaComments, FaPaperPlane } from "react-icons/fa";
import chatbotService from "../services/chatbotService";

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "🤖 Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await chatbotService.askQuestion(input);

      setMessages([
        ...newMessages,
        { from: "bot", text: answer || "Xin lỗi, tôi chưa có câu trả lời." },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { from: "bot", text: "⚠️ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Nút mở/đóng chatbot */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        <FaComments />
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "320px",
            height: "420px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#007bff",
              color: "white",
              padding: "12px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            🤖 Chatbot Hỗ Trợ
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              background: "#f9f9f9",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.from === "user" ? "right" : "left",
                  margin: "8px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: "18px",
                    backgroundColor:
                      msg.from === "user" ? "#007bff" : "#e5e5ea",
                    color: msg.from === "user" ? "white" : "black",
                    maxWidth: "80%",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}

            {/* Hiệu ứng bot đang gõ */}
            {isLoading && (
              <div style={{ textAlign: "left", margin: "8px 0" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: "18px",
                    backgroundColor: "#e5e5ea",
                    color: "black",
                    maxWidth: "80%",
                    fontStyle: "italic",
                  }}
                >
                  Bot đang trả lời<span className="dotting">...</span>
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ccc",
              padding: "6px",
              background: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                background: "#f1f1f1",
                marginRight: "6px",
              }}
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={handleSend}
              style={{
                border: "none",
                background: "#007bff",
                color: "white",
                borderRadius: "8px",
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotWidget;
