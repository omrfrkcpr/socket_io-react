import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import useAuthCalls from "../hooks/useAuthCalls";
import { MdLogout, MdCancel } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import useAxios from "../hooks/useAxios";

function ConversationList({ setActiveRoom, activeRoom }) {
  const { currentUser, users, token } = useSelector((state) => state.auth);
  const { logout, getAllUsers } = useAuthCalls();
  const [conversations, setConversations] = useState([]);
  const axiosWithToken = useAxios();
  const [newConversationName, setNewConversationName] = useState("");
  const [editConversationName, setEditConversationName] = useState("");
  const [editConversationId, setEditConversationId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown gösterimi için

  const socket = io.connect(process.env.REACT_APP_SERVER_URL, {
    query: { token },
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  // console.log(users);

  useEffect(() => {
    getAllUsers();
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
    const { data } = await axiosWithToken.get(`/conversations`);
    console.log(data);
    setConversations(data.data);
  };

  const createConversation = async () => {
    if (newConversationName && selectedUsers.length > 0) {
      socket.emit("new_conversation", {
        name: newConversationName,
        createdBy: currentUser._id,
        participantIds: selectedUsers,
      });
      fetchConversations();
      setNewConversationName("");
      setSelectedUsers([]);
    }
  };

  const updateConversation = async (name) => {
    if (editConversationName) {
      await axiosWithToken.put(`/conversations/name/${name}`, {
        name: editConversationName,
      });
      setEditConversationId(null);
      setEditConversationName("");
      fetchConversations();
      socket.emit("update_conversation");
    }
  };

  const deleteConversation = async (name) => {
    await axiosWithToken.delete(`/conversations/name/${name}`);

    fetchConversations();
    socket.emit("delete_conversation");
  };

  const handleUserSelect = (event) => {
    const selectedUserId = event.target.value;
    if (!selectedUsers.includes(selectedUserId)) {
      setSelectedUsers([...selectedUsers, selectedUserId]);
    }
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  };

  return (
    <div className="p-4 w-full h-full bg-gray-800 text-white flex flex-col">
      <div className="flex justify-between items-center border-b pb-3 border-white">
        <div className="flex space-x-2 items-center">
          <img
            src={currentUser.avatar}
            alt="user-avatar"
            className="rounded-full h-8 w-8 bg-white"
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
      <div className="flex flex-col space-y-2 overflow-y-auto mb-4 pb-3 border-b border-white">
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

      {/* Custom Dropdown */}
      <div className="relative mb-4">
        <button
          className="p-2 mb-2 rounded-lg bg-gray-700 w-full flex justify-between items-center"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>Select participants...</span>
          <span>
            <FaCaretDown />
          </span>
        </button>
        {showDropdown && (
          <div className="absolute z-10 w-full bg-gray-800 rounded-lg border border-gray-700">
            {users.map((user) => (
              <div
                key={user._id}
                className={`p-2 flex justify-between items-center cursor-pointer border-b border-gray-700 ${
                  selectedUsers.includes(user._id)
                    ? "bg-blue-600"
                    : "hover:bg-gray-600"
                }`}
                onClick={() => {
                  if (selectedUsers.includes(user._id)) {
                    removeSelectedUser(user._id); // Seçili kullanıcıdan çıkar
                  } else {
                    handleUserSelect({ target: { value: user._id } }); // Kullanıcıyı ekle
                  }
                }}
              >
                <div className="flex gap-2 items-center">
                  <span>
                    <img
                      src={user.avatar}
                      alt="user-avatar"
                      className="rounded-full h-8 w-8 bg-white"
                    />
                  </span>
                  <span>{user.username}</span>
                </div>
                {selectedUsers.includes(user._id) && (
                  <FaCheck className="text-green-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        onClick={createConversation}
      >
        Create Conversation
      </button>
      <div className="mt-2">
        <h3>Selected Participants:</h3>
        <ul>
          {selectedUsers.map((userId) => {
            const user = users.find((user) => user._id === userId);
            return (
              <li key={userId} className="flex items-center justify-between">
                {user.username}
                <MdCancel
                  className="text-red-500 cursor-pointer ml-2"
                  onClick={() => removeSelectedUser(userId)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default ConversationList;
