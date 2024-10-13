import React, { useEffect, useRef, useState } from "react";
import { parseISO, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSelector } from "react-redux";
import useAxios from "../hooks/useAxios";
import { MdClose } from "react-icons/md";
import { useSocket } from "../SocketContext";

function Chat({ activeRoom, setActiveRoom, conversations, setConversations }) {
  const { currentUser } = useSelector((state) => state.auth);
  const socket = useSocket();
  const axiosWithToken = useAxios();
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
      const { data } = await axiosWithToken.get(
        `/conversations/name/${activeRoom}`
      );

      // console.log(data);
      setMessages(data.data.messages);

      setConversations((prevConversations) =>
        prevConversations.map((conversation) => {
          // Check if the conversation ID matches the active room
          if (conversation._id === data.data._id) {
            // Return a new object with updated messages
            return {
              ...conversation,
              messages: data.data.messages,
              // ...data.data,
            };
          }
          return conversation; // return the unchanged conversation
        })
      );
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
    <div className="flex flex-col h-full w-full p-1 md:p-4 relative">
      <button
        className="absolute right-10 md:right-12 top-6 bg-red-600 text-white p-[2px] rounded-full text-lg md:text-xl hover:opacity-50"
        onClick={() => setActiveRoom(null)}
      >
        <MdClose />
      </button>
      <div className="flex-1 overflow-y-scroll mb-4 pt-10 px-4 pb-4 bg-gray-700 rounded-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              msg.senderId._id === currentUser._id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className=" max-w-xs w-full relative">
              <img
                src={msg.senderId.avatar}
                alt="user-avatar"
                className="rounded-full h-8 w-8 bg-white absolute top-7"
              />
              <div>
                <p className="ml-11 text-white text-sm mb-1">
                  {msg.senderId.username}
                </p>
                <div className="mb-2 ml-10 p-2 text-white bg-gray-800 rounded-lg">
                  <p>{msg.content}</p>
                </div>
              </div>
              <p className="absolute -bottom-3 right-0 text-white text-xs">
                {formatDynamicDate(msg.createdAt)}
              </p>
            </div>
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
