import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect(process.env.REACT_APP_SERVER_URL);

function Chat({ activeRoom }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (activeRoom) {
      socket.emit("join_room", activeRoom);
      fetchMessages();
    }

    socket.on("receive_message", (data) => {
      if (data.room === activeRoom) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [activeRoom]);

  const fetchMessages = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/conversations/name/${activeRoom}`
    );
    setMessages(response.data.messages.map((msg) => msg.content));
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { message, room: activeRoom });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-700 rounded-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="mb-2 p-2 text-white bg-gray-800 rounded-lg"
          >
            <p>{msg}</p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 p-2 rounded-l-lg text-white bg-gray-800"
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
