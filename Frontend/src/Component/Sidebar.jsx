import api from '@/Utils/axios';
import React, { useEffect, useState } from 'react';

export default function Sidebar({ selectedChat, onSelectChat, chats, setChats }) {
  // const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])

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
  return (
    <div className="flex flex-col h-full bg-[#111b21] md:border-r border-[#304946]">
      <div className="p-3 border-b border-[#222d34]">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full bg-[#202c33] text-sm text-[#e9edef] placeholder-[#8696a0] px-4 py-2 rounded-lg outline-none border border-transparent focus:border-[#00a884]"
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40 scrollbar-thin scrollbar-thumb-gray-600 rounded-2xl ">
        {chats.map((chat) => {
          const isSelected = selectedChat?.id === chat.id;
          return (
            <div
              key={chat?._id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors hover:bg-[#2e3e48e0] border-b border-[#2e3c459c]  ${isSelected ? 'bg-[#1f2a31]' : 'hover:bg-[#354854]'
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
            </div>
          );
        })}
      </div>
    </div>
  );
}