import React, { useState } from "react";
import ConversationList from "./components/ConversationList";
import Chat from "./components/Chat";

function App() {
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-900 text-white">
        <ConversationList
          activeRoom={activeRoom}
          setActiveRoom={setActiveRoom}
        />
      </div>
      <div className="w-3/4 bg-gray-100 flex items-center justify-center">
        {activeRoom ? (
          <Chat activeRoom={activeRoom} />
        ) : (
          <h3 className="text-xl">Select a conversation</h3>
        )}
      </div>
    </div>
  );
}

export default App;
