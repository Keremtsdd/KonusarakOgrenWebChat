import React, { useEffect, useState, useRef } from "react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ForumIcon from "@mui/icons-material/Forum";
import SendIcon from "@mui/icons-material/Send";
import { useLocation } from "react-router-dom";
import image from "../assets/image.png";

const API_BASE_URL = "https://chatapi-c72y.onrender.com/api/Chat";

export default function ChatPage() {
  const location = useLocation();
  const bottomRef = useRef(null);
  const { name } = location.state;

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    // 1. Sayfa ilk yüklendiğinde bir kez çek
    fetchMessages();

    // 2. Her 3 saniyede bir mesajları yeniden çek
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 3000); // 3000 milisaniye = 3 saniye

    // Component ayrıldığında interval'ı temizle
    return () => clearInterval(intervalId);
  }, []); // Bağımlılık dizisi boş kalır

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const HandleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const newMessage = {
      Rumuz: name,
      MessageText: currentMessage.trim(),
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const sentMessage = await response.json();

      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setCurrentMessage("");
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
    }
  };

  const getSentimentColor = (score) => {
    if (score === "POZİTİF") return "text-green-600 text-sm";
    if (score === "NEGATİF") return "text-red-600 text-sm";
    return "text-yellow-600 text-sm";
  };

  const getBubbleStyle = (messageRumuz) => {
    return messageRumuz === name
      ? "bg-blue-600 text-white justify-end"
      : "bg-white text-gray-800 justify-start";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-700 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ForumIcon
            style={{ color: "white", fontSize: 30 }}
            className="ml-10"
          />
          <h1 className="text-white text-2xl font-bold -mt-1">Sohbet Odası</h1>
          <img src={image} alt="konusarakogren" className="h-10" />
        </div>
        <div className="flex">
          <AccountCircleOutlinedIcon style={{ color: "white", fontSize: 35 }} />
          <h1 className="text-white text-lg font-semibold mt-1 ml-1 mr-10">
            {name}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.Id}
            className={`flex ${
              msg.rumuz === name ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col max-w-[75%] md:max-w-md">
              {/* 4. MESAJ BALONU: İçeriğe göre otomatik genişleyen asıl balon */}
              <div
                className={`px-3 py-1 rounded-xl text-md shadow break-words
                        ${getBubbleStyle(msg.rumuz)}`}
              >
                <p
                  className={`font-semibold text-sm text-black ${
                    msg.rumuz === name ? "text-left" : "text-left"
                  }`}
                >
                  {msg.rumuz}
                </p>
                <p>{msg.messageText}</p>
                {/* Duygu Skoru Kodu: Yorum satırından çıkarıldı */}
                <p className={getSentimentColor(msg.emotionScore)}>
                  Duygu: {msg.emotionScore && msg.emotionScore.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={HandleSendMessage}
        className="flex items-center border-t bg-white px-4 py-3"
      >
        <input
          type="text"
          name="message"
          placeholder="Bir mesaj yazın..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          className="flex-1 py-3 px-4 bg-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <button type="submit" className="ml-3">
          <SendIcon
            style={{ color: "blue", fontSize: 35 }}
            className="cursor-pointer hover:scale-105  transition-transform"
          />
        </button>
      </form>
    </div>
  );
}
