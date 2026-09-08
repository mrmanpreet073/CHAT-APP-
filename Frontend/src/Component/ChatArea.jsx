import React, { useEffect, useState } from 'react';
import { ArrowLeft, Paperclip, Send, User } from 'lucide-react';
import { getSocket } from '@/Socket.jsx';
import { NEW_MESSAGE } from '@/Utils/events.js';
import api from '@/Utils/axios';

export default function ChatArea({ chat, onBack, onToggleProfile, chatId, members }) {
  const socket = getSocket()
  const [messages, setMessages] = useState([]);

  console.log("Frontend Token",socket.id);
  

  const handleSubmit = () => {
    if (!message.trim()) return;
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  }

  useEffect(() => {
    console.log("4. UseEffect Run");
    const handleNewMessage = ({ chatId, message }) => {

      console.log("Message Recieved", message);

      setMessages((prev) => [
        ...prev,
        message
      ]);
    };
    socket.on(NEW_MESSAGE, handleNewMessage);
    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage);
    };
  }, [socket]);

  // Fetching Old Messages 
  const getMessages = async (chatId) => {
    try {
      console.log("GET MEssages Run");

      const response = await api.post(`/chat/getChatMessages/${chatId}`);
      console.log("message Response", response);

      if (response.data.success) {
        setMessages(response.data.messages); // Replace with DB messages
      }
    } catch (error) {
      console.log("Error Fetching Messages", error.message);

    }
  };

  useEffect(() => {
    if (chatId) getMessages(chatId);
  }, [chatId]);


  const [message, setMessage] = useState("")
  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#8696a0] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
          <User size={32} className="text-[#00a884]" />
        </div>
        <p className="text-lg text-[#e9edef]">Select a user to start chatting</p>
      </div>
    );

  }

  console.log("messages", messages);


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-[#aebac1] hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="text-sm font-medium text-[#e9edef]">{chat.name}</h2>
            <p className="text-xs text-[#00a884]">online</p>
          </div>
        </div>

        <button
          onClick={onToggleProfile}
          className="text-[#aebac1] hover:text-[#00a884] text-xs font-medium px-3 py-1.5 rounded-md bg-[#111b21]/50 border border-[#222d34]"
        >
          View Profile
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b141a]">

        {messages.map((msg) => {

          const isMyMessage =
            msg.sender._id != chat._id;

          console.log("isMyMessage", isMyMessage);


          return (
            <div
              key={msg._id}
              className={`flex ${isMyMessage
                ? "justify-end"
                : "justify-start"
                }`}
            >
              <div
                className={`px-3 py-1 rounded-lg max-w-[80%] md:max-w-[60%] ${isMyMessage
                  ? "bg-[#005c4b]"
                  : "bg-[#202c33]"
                  }`}
              >
                {!isMyMessage && (
                  <span className="block text-xs font-medium text-[#00a884] mb-1">
                    {/* {msg.sender.name} */}
                  </span>
                )}

                <p className="text-sm ">
                  {msg.content}
                </p>

                <span className="block text-[10px] text-[#8696a0] text-right mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#202c33] flex items-center gap-3 border-t border-[#222d34] shrink-0">
        <button className="text-[#aebac1] hover:text-white"><Paperclip size={20} /></button>
        <input
          type="text"
          value={message}
          onChange={(e) => (setMessage(e.target.value))}
          placeholder="Type Message Here..."
          className="flex-1 bg-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-[#00a884]"
        />
        <button
          onClick={() => handleSubmit()}
          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029071] text-[#111b21] flex items-center justify-center transition-transform active:scale-95">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}