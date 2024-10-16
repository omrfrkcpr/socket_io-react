import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";

const Home = () => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [conversations, setConversations] = useState([]);

  return (
    <div className="flex h-screen">
      <Sidebar
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        conversations={conversations}
        setConversations={setConversations}
      />

      <div className="w-[calc(100vw-60px)] md:w-3/4 bg-gray-100 flex items-center justify-center">
        {activeChannel ? (
          <Chat
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            conversations={conversations}
            setConversations={setConversations}
          />
        ) : (
          <h3 className="px-10 text-center text-md md:text-xl">
            Select or create a conversation from side menu
          </h3>
        )}
      </div>
    </div>
  );
};

export default Home;
