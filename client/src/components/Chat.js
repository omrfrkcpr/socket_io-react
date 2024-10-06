import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { parseISO, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

const socket = io.connect(process.env.REACT_APP_SERVER_URL);

function Chat({ activeRoom }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeRoom) {
      socket.emit("join_room", activeRoom);
      fetchMessages();
    }

    socket.on("receive_message", (data) => {
      if (data.room === activeRoom) {
        fetchMessages();
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [activeRoom]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/conversations/name/${activeRoom}`
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { message, room: activeRoom });
      setMessage("");
    }
  };

  function formatDynamicDate(dateStr) {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
  }

  // useEffect to update message timestamps every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({
          ...msg,
          formattedDate: formatDynamicDate(msg.createdAt),
        }))
      );
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Initial formatting of dates
  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({
        ...msg,
        formattedDate: formatDynamicDate(msg.createdAt),
      }))
    );
  }, [activeRoom]);

  // Scroll to the bottom of the messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex-1 overflow-y-scroll mb-4 p-4 bg-gray-700 rounded-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="mb-2 p-2 text-white bg-gray-800 rounded-lg flex justify-between items-start w-1/2"
          >
            <p>{msg.content}</p>
            <p className="text-sm">{formatDynamicDate(msg.createdAt)}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          className="flex-1 p-2 rounded-l-lg text-white bg-gray-800"
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(e.target.value)}
        />
        <button
          className="p-2 bg-blue-600 rounded-r-lg text-white hover:bg-blue-500"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
