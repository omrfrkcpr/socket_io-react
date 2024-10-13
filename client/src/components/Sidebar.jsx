import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAuthCalls from "../hooks/useAuthCalls";
import { MdLogout, MdCancel } from "react-icons/md";
import {
  FaCheck,
  FaCaretDown,
  FaAngleRight,
  FaAngleLeft,
  FaEdit,
} from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import useAxios from "../hooks/useAxios";
import { useSocket } from "../SocketContext";
import NotificationsPopup from "./NotificationsPopup";
import toastNotify from "../helpers/toastNotify";

function Sidebar({
  setActiveRoom,
  activeRoom,
  conversations,
  setConversations,
}) {
  const { currentUser, users } = useSelector((state) => state.auth);
  const socket = useSocket();
  const { logout, getAllUsers } = useAuthCalls();
  const axiosWithToken = useAxios();
  const [newConversationName, setNewConversationName] = useState("");
  const [editConversationName, setEditConversationName] = useState("");
  const [editConversationId, setEditConversationId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchNotifications();
    getAllUsers();
  }, []);

  useEffect(() => {
    if (!conversations.some((conv) => conv.name === activeRoom)) {
      setActiveRoom(null);
    }
  }, [conversations, activeRoom]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_notifications", (data) => {
        if (data.find((n) => n.userId === currentUser._id))
          setNotifications(data);
      });

      socket.on("receive_conversations", () => {
        fetchConversations();
      });

      return () => {
        socket.off("receive_notifications");
        socket.off("receive_conversations");
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    const { data } = await axiosWithToken.get(`/conversations`);
    console.log(data);
    setConversations(data.data);
  };

  const fetchNotifications = async () => {
    const { data } = await axiosWithToken.get(`/notifications`);
    console.log(data);
    setNotifications(data.data);
  };

  const createConversation = async () => {
    if (newConversationName && selectedUsers.length > 0) {
      try {
        await axiosWithToken.post(`/conversations`, {
          name: newConversationName,
          participantIds: selectedUsers,
        });
      } catch (error) {
        console.log(error);
        toastNotify("error", error.message);
      } finally {
        setNewConversationName("");
        setSelectedUsers([]);
      }
    }
  };

  const updateConversation = async (name) => {
    if (editConversationName) {
      try {
        await axiosWithToken.put(`/conversations/name/${name}`, {
          name: editConversationName,
        });
      } catch (error) {
        console.log(error);
        toastNotify("error", error.message);
      } finally {
        setEditConversationId(null);
        setEditConversationName("");
      }
    }
  };

  const deleteConversation = async (name) => {
    try {
      await axiosWithToken.delete(`/conversations/name/${name}`);
    } catch (error) {
      console.log(error);
      toastNotify("error", error.message);
    } finally {
      if (name === activeRoom) {
        setActiveRoom(null);
      }
    }
  };

  const handleUserSelect = (event) => {
    const selectedUserId = event.target.value;
    if (!selectedUsers.includes(selectedUserId)) {
      setSelectedUsers([...selectedUsers, selectedUserId]);
    }
  };

  const handleConversationClick = (conversationName) => {
    setActiveRoom(conversationName);
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId));
  };

  return (
    <>
      <div
        className={`flex flex-col transition-all duration-300 ${
          showSidebarMenu ? "w-[300px] md:w-1/3" : "w-[60px] md:w-1/3"
        } bg-gray-900 text-white`}
      >
        <div className="p-4 w-full h-full bg-gray-800 text-white flex flex-col">
          <div
            className={`flex ${
              showSidebarMenu ? "border-b border-white" : "flex-col md:flex-row"
            }  justify-between items-center pb-3 md:border-b md:border-white`}
          >
            <div
              className={`flex ${
                !showSidebarMenu && "flex-col md:flex-row border-b border-white"
              } gap-2 items-center md:border-none relative`}
            >
              <img
                src={currentUser.avatar}
                alt="user-avatar"
                className="rounded-full h-8 w-8 bg-white"
              />
              <span
                onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                className={`absolute md:hidden ${
                  showSidebarMenu ? "-right-[90px] -top-3" : "-right-3 top-2"
                } hover:text-gray-300 cursor-pointer`}
              >
                {showSidebarMenu ? <FaAngleLeft /> : <FaAngleRight />}
              </span>
              <h3 className="text-sm md:text-md">{currentUser.username}</h3>
            </div>
            <button
              onClick={() => logout()}
              className={`flex ${
                showSidebarMenu ? "" : "flex-col md:flex-row mt-4 md:mt-0"
              }  items-center md:gap-1 hover:text-gray-300`}
            >
              <span
                className={`${
                  showSidebarMenu ? "hidden" : ""
                } text-sm md:text-md`}
              >
                Logout
              </span>
              <span>
                <MdLogout className="text-[24px] pt-1 md:pt-0 md:text-[16px]" />
              </span>
            </button>
          </div>
          <div className={`${showSidebarMenu ? "block" : "hidden"} md:block`}>
            <div
              onClick={() => setShowNotifications(true)}
              className="hover:bg-gray-500 cursor-pointer border-b border-white"
            >
              <h2 className="text-lg md:text-xl font-bold py-3 space-x-1">
                <span>Notifications</span>
                {notifications && (
                  <span
                    className={`${
                      notifications.find(
                        (notification) => notification?.isRead === false
                      ) && "bg-red-400 px-2"
                    }`}
                  >
                    {notifications.filter(
                      (notification) => notification.isRead === false
                    ).length
                      ? notifications.filter(
                          (notification) => notification.isRead === false
                        ).length
                      : ""}
                  </span>
                )}
              </h2>
            </div>

            <h2 className="text-lg md:text-xl font-bold mb-4 pt-3 space-x-1">
              <span>Conversations</span>
              <span>({conversations.length})</span>
            </h2>
            <div className="flex flex-col space-y-2 overflow-y-auto max-h-[300px] mb-4 pb-3 border-b border-white">
              {conversations &&
                conversations.map((conversation) => {
                  const isNewMessage = conversation.messages.some(
                    (message) => !message.readerIds.includes(currentUser._id)
                  );
                  return (
                    <div
                      key={conversation._id}
                      className={`cursor-pointer text-sm md:text-md p-2 rounded-lg flex justify-between ${
                        activeRoom === conversation.name
                          ? "bg-blue-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() =>
                        handleConversationClick(
                          conversation.name,
                          conversation._id
                        )
                      }
                    >
                      <div className="grid place-content-center">
                        {editConversationId === conversation.name ? (
                          <input
                            className="p-2 rounded-lg w-[80px] text-sm md:text-md bg-gray-500"
                            value={editConversationName}
                            onChange={(e) =>
                              setEditConversationName(e.target.value)
                            }
                          />
                        ) : (
                          <div className="space-x-1">
                            <span>{conversation.name}</span>
                            <span
                              className={isNewMessage ? "text-red-500" : ""}
                            >
                              ({conversation.messages.length})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center items-center">
                        {editConversationId === conversation.name ? (
                          <button
                            className="px-2 py-1 ml-2 bg-green-600 rounded-lg hover:bg-green-500"
                            onClick={() =>
                              updateConversation(conversation.name)
                            }
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="p-1 md:px-2 md:py-1 ml-2 bg-yellow-600 rounded-lg hover:bg-yellow-500"
                            onClick={() => {
                              setEditConversationId(conversation.name);
                              setEditConversationName(conversation.name);
                            }}
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          className="p-1 md:px-2 md:py-1 ml-2 bg-red-600 rounded-lg hover:bg-red-500"
                          onClick={() => deleteConversation(conversation.name)}
                        >
                          <RiDeleteBin5Fill />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
            <input
              className="py-1 px-2 md:p-2 mb-2 text-sm md:text-md rounded-lg bg-gray-700 w-full"
              placeholder="Conversation Name..."
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
            />

            {/* Custom Dropdown */}
            <div className="relative mb-4">
              <button
                className="p-2 mb-2 text-sm md:text-md rounded-lg bg-gray-700 w-full flex justify-between items-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>Select participants...</span>
                <span>
                  <FaCaretDown />
                </span>
              </button>
              {showDropdown && (
                <div className="absolute z-10 w-full bg-gray-800 rounded-lg border border-gray-700 h-auto max-h-[200px] overflow-y-auto">
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
                      <div className="flex gap-2 items-center text-sm md:text-md">
                        <span>
                          <img
                            src={user.avatar}
                            alt="user-avatar"
                            className="rounded-full h-6 w-6 md:h-8 md:w-8 bg-white"
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
              className={`p-2 bg-blue-600 rounded-lg  text-sm md:text-md w-full ${
                !newConversationName && !selectedUsers.length
                  ? "bg-gray-400"
                  : "hover:bg-blue-500"
              }`}
              onClick={createConversation}
              disabled={!newConversationName && !selectedUsers.length}
            >
              Create Conversation
            </button>
            <div className="mt-2">
              <h3 className="text-sm md:text-md">Selected Participants:</h3>
              <ul>
                {selectedUsers.map((userId) => {
                  const user = users.find((user) => user._id === userId);
                  return (
                    <li
                      key={userId}
                      className="flex items-center text-sm md:text-md justify-between"
                    >
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
        </div>
      </div>
      <NotificationsPopup
        notifications={notifications}
        setNotifications={setNotifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </>
  );
}

export default Sidebar;
