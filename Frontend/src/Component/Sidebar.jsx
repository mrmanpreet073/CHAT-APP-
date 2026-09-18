import { getSocket } from '@/Socket.jsx';
import api from '@/Utils/axios';
import { NEW_MESSAGE_ALERT } from '@/Utils/events.js';
import React, { useEffect, useState } from 'react';

export default function Sidebar({ selectedChat, onSelectChat, chats, setChats, unreadMessages, setUnreadMessages }) {
  // const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])



  const socket = getSocket();

  // console.log("Unread Messages:", unreadMessages);

  // console.log("unreadMessages[chat._id]", unreadMessages[chat._id]);
  useEffect(() => {

    const fetchChats = async () => {
      setLoading(true);
      try {
        const response = await api.post("/user/friends");
        // Accessing response array directly
        // console.log(response)
        setChats(response.data.friends || []);
      } catch (error) {
        console.error(error);
        // toast.error(
        //   error.response?.data?.message || "Failed to load notifications"
        // );
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [])

  useEffect(() => {
    const handleMessageAlert = ({ userId }) => {
      setUnreadMessages((prev) => ({
        ...prev,
        [userId]: (prev[userId] || 0) + 1
      }));


      // console.log("Unread Message", unreadMessages);

    };

    socket.on(NEW_MESSAGE_ALERT, handleMessageAlert);

    return () => {
      socket.off(NEW_MESSAGE_ALERT, handleMessageAlert);
    };
  }, [socket]);

  useEffect(() => {
    const handleNotificationRead = ({ userId }) => {
      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };

    socket.on("NOTIFICATION_READ", handleNotificationRead);

    return () => {
      socket.off("NOTIFICATION_READ", handleNotificationRead);
    };
  }, [socket]);

  useEffect(() => {

    const sendNotification = async () => {
      try {
        const response = await api.get("/chat/UnreadNotifications");
        // console.log("Notification response", response);

        if (response.data.success) {
          setUnreadMessages(response.data.unreadMessages);
        }
      }
      catch (error) {
        console.log(error.response);
      }
    }

    sendNotification();
  }, [])



  return (
    <div className="flex flex-col h-full bg-[#111b21] md:border-r border-[#304946]">
      {/* <div className="p-3 border-b border-[#222d34]">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full bg-[#202c33] text-sm text-[#e9edef] placeholder-[#8696a0] px-4 py-2 rounded-lg outline-none border border-transparent focus:border-[#00a884]"
        />
      </div> */}

      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40 scrollbar-thin scrollbar-thumb-gray-600 rounded-2xl ">
        {chats.map((chat) => {
          const isSelected = selectedChat?.id != chat?.id;
          // console.log("selectedChat",selectedChat );
          // console.log("chat",chat  );

          return (
            <div
              key={chat?._id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors  hover:bg-[#2e3e48e0] border-b border-[#2e3c4526]  ${isSelected ? 'bg-[#0b141a]' : 'bg-[#0b141a]'
                }`}
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover border border-[#222d34]"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[#e9edef] truncate">{chat.name}</h3>
                <p className="text-xs text-[#8696a0] truncate">{chat.bio}</p>
              </div>

              {unreadMessages[chat._id] > 0 && (
                <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                  {unreadMessages[chat._id]}
                </span>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}