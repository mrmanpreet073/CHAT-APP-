import { getSocket } from '@/Socket.jsx';
import api from '@/Utils/axios';
import { NEW_MESSAGE_ALERT } from '@/Utils/events.js';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function Sidebar({
  selectedChat,
  onSelectChat,
  chatId,
  chats,
  setChats,
  unreadMessages,
  setUnreadMessages,
  setSelectedChat,
}) {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const user = useSelector((state) => state.auth.user);
  const socket = getSocket();

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      try {
        const response = await api.post("/user/friends");
        setChats(response.data.friends || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [setChats]);

  // Real-time message notifications
  useEffect(() => {
    const handleMessageAlert = ({
      chatId: incomingChatId,
      senderId,
    }) => {
      console.log("🔥 REALTIME ALERT RECEIVED");
      console.log("incomingChatId:", incomingChatId);
      console.log("senderId:", senderId);
      console.log("user.id:", user?.id);
      console.log("chatId:", chatId);

      // Don't show notification for our own message
      if (String(senderId) === String(user?.id)) {
        console.log("Same User");
        return;
      }

      // Don't show notification if this chat is currently open
      if (String(chatId) === String(incomingChatId)) {
        console.log("Chat Open");
        return;
      }

      console.log("✅ Updating unread");

      setUnreadMessages((prev) => ({
        ...prev,
        [incomingChatId]: (prev[incomingChatId] || 0) + 1,
      }));
    };

    socket.on(NEW_MESSAGE_ALERT, handleMessageAlert);

    return () => {
      socket.off(NEW_MESSAGE_ALERT, handleMessageAlert);
    };
  }, [socket, chatId, user?.id, setUnreadMessages]);

  // Debug unread state
  useEffect(() => {
    console.log("🔔 UNREAD STATE:", unreadMessages);
  }, [unreadMessages]);

  // Fetch existing unread notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/chat/UnreadNotifications");

        if (response.data.success) {
          const serverUnread = response.data.unreadMessages || {};

          setUnreadMessages((prev) => {
            const merged = { ...prev };

            Object.entries(serverUnread).forEach(([chatId, count]) => {
              merged[chatId] = Math.max(
                merged[chatId] || 0,
                count
              );
            });

            return merged;
          });
        }
      } catch (error) {
        console.log(error.response);
      }
    };

    fetchNotifications();
  }, [setUnreadMessages]);

  // Notification read event
  useEffect(() => {
    const handleNotificationRead = ({ chatId: readChatId }) => {
      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[readChatId];
        return updated;
      });
    };

    socket.on("NOTIFICATION_READ", handleNotificationRead);

    return () => {
      socket.off("NOTIFICATION_READ", handleNotificationRead);
    };
  }, [socket, setUnreadMessages]);

  return (
    <div className="flex flex-col h-full bg-[#111b21] md:border-r border-[#304946]">

      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40 scrollbar-thin scrollbar-thumb-gray-600 rounded-2xl">

        {loading ? (
          <div className="p-4 text-center text-[#8696a0]">
            Loading...
          </div>
        ) : (
          chats.map((chat) => {

            console.log("CHAT FROM SIDEBAR:", chat);

            console.log(
              "CHAT ID:",
              chat?._id,
              "UNREAD:",
              unreadMessages?.[chat?._id]
            );
            const isSelected =
              String(selectedChat?._id) === String(chat?._id);

            return (
              <div
                key={chat?._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors hover:bg-[#2e3e48e0] border-b border-[#2e3c4526] ${isSelected
                  ? 'bg-[#202c33]'
                  : 'bg-[#0b141a]'
                  }`}
              >
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#222d34]"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#e9edef] truncate">
                    {chat.name}
                  </h3>

                  <p className="text-xs text-[#8696a0] truncate">
                    {chat.bio}
                  </p>
                </div>

                {unreadMessages?.[chat.chatId] > 0 && (
                  <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                    {unreadMessages[chat.chatId]}
                  </span>
                )}
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}