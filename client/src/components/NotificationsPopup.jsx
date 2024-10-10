import { formatDistanceToNow, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import React, { useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import useAxios from "../hooks/useAxios";

const NotificationsPopup = ({
  showNotifications,
  setShowNotifications,
  notifications,
  setNotifications,
}) => {
  const axiosWithToken = useAxios();
  const prevShowNotificationsRef = useRef(showNotifications);

  function formatDynamicDate(dateStr) {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
  }

  // useEffect to update message timestamps every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          formattedDate: formatDynamicDate(notification.createdAt),
        }))
      );
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // useEffect to handle notification read status on popup close
  useEffect(() => {
    if (prevShowNotificationsRef.current && !showNotifications) {
      readAllNotifications();
    }
    prevShowNotificationsRef.current = showNotifications;
  }, [showNotifications]);

  const readAllNotifications = async () => {
    try {
      const { data } = await axiosWithToken.get(`/notifications/read`);
      setNotifications(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {showNotifications && (
        <div className="w-screen h-screen absolute">
          <div className="w-screen h-screen bg-black/40" />
          <div className="absolute w-[50%] h-auto min-h-[400px] max-w-[400px] md:max-w-[600px] bg-white top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-50 rounded-md shadow-md p-4">
            <button
              onClick={() => {
                setShowNotifications(false);
                readAllNotifications();
              }}
              className="absolute right-2 top-2"
            >
              <IoMdClose />
            </button>
            <h2 className="font-semibold text-center border-b py-2">
              Notifications
            </h2>
            <ul className="space-y-1 h-auto max-h-[400px] overflow-y-scroll">
              {notifications &&
                notifications.map((notification) => {
                  return (
                    <li
                      key={notification._id}
                      className={`${
                        !notification.isRead && "bg-gray-300"
                      } p-2 cursor-pointer rounded-md border border-gray-300 flex flex-col justify-between gap-1 pe-10`}
                    >
                      <span className="text-green-700">
                        {notification.content}
                      </span>
                      <span>{formatDynamicDate(notification.createdAt)}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsPopup;
