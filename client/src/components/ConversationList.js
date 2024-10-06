import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import useAuthCalls from "../hooks/useAuthCalls";
import { MdLogout } from "react-icons/md";

const socket = io.connect(process.env.REACT_APP_SERVER_URL);

function ConversationList({ setActiveRoom, activeRoom }) {
  const { currentUser } = useSelector((state) => state.auth);
  const { logout } = useAuthCalls();
  const [conversations, setConversations] = useState([]);
  const [newConversationName, setNewConversationName] = useState("");
  const [editConversationName, setEditConversationName] = useState("");
  const [editConversationId, setEditConversationId] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!conversations.some((conv) => conv.name === activeRoom)) {
      setActiveRoom(null);
    }
  }, [conversations, activeRoom]);

  useEffect(() => {
    socket.on("update_conversations", (data) => {
      setConversations(data);
    });

    return () => {
      socket.off("update_conversations");
    };
  }, []);

  const fetchConversations = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/conversations`
    );
    setConversations(response.data);
  };

  const createConversation = async () => {
    if (newConversationName) {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/conversations`, {
        name: newConversationName,
      });
      setNewConversationName("");
      fetchConversations();
      socket.emit("new_conversation");
    }
  };

  const updateConversation = async (name) => {
    if (editConversationName) {
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/conversations/name/${name}`,
        {
          name: editConversationName,
        }
      );
      setEditConversationId(null);
      setEditConversationName("");
      fetchConversations();
      socket.emit("update_conversation");
    }
  };

  const deleteConversation = async (name) => {
    await axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/conversations/name/${name}`
    );

    fetchConversations();
    socket.emit("delete_conversation");
  };

  return (
    <div className="p-4 w-full h-full bg-gray-800 text-white flex flex-col">
      <div className="flex justify-between items-center border-b pb-3 border-white">
        <div className="flex space-x-2 items-center">
          <img
            src="https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
            alt=""
            className="rounded-full h-8 w-8"
          />
          <h3>{currentUser.username}</h3>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-1 hover:text-gray-300"
        >
          Logout <MdLogout />
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4 pt-3">Conversations</h2>
      <div className="flex flex-col space-y-2 overflow-y-auto mb-4">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            className={`cursor-pointer p-2 rounded-lg flex justify-between ${
              activeRoom === conversation.name
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setActiveRoom(conversation.name)}
          >
            <div className="grid place-content-center">
              {editConversationId === conversation.name ? (
                <input
                  className="p-2 rounded-lg w-[80px] bg-gray-500"
                  value={editConversationName}
                  onChange={(e) => setEditConversationName(e.target.value)}
                />
              ) : (
                `${conversation.name} (${conversation.messages.length})`
              )}
            </div>

            <div className="flex justify-center items-center">
              {editConversationId === conversation.name ? (
                <button
                  className="px-2 py-1 ml-2 bg-green-600 rounded-lg hover:bg-green-500"
                  onClick={() => updateConversation(conversation.name)}
                >
                  Save
                </button>
              ) : (
                <button
                  className="px-2 py-1 ml-2 bg-yellow-600 rounded-lg hover:bg-yellow-500"
                  onClick={() => {
                    setEditConversationId(conversation.name);
                    setEditConversationName(conversation.name);
                  }}
                >
                  Edit
                </button>
              )}
              <button
                className="px-2 py-1 ml-2 bg-red-600 rounded-lg hover:bg-red-500"
                onClick={() => deleteConversation(conversation.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <input
        className="p-2 mb-2 rounded-lg bg-gray-700"
        placeholder="New Conversation Name..."
        value={newConversationName}
        onChange={(e) => setNewConversationName(e.target.value)}
      />
      <button
        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        onClick={createConversation}
      >
        Create Conversation
      </button>
    </div>
  );
}

export default ConversationList;
