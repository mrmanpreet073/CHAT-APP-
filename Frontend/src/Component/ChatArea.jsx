import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, Loader2, Paperclip, Send, User, X } from 'lucide-react';
import { getSocket } from '@/Socket.jsx';
import { NEW_MESSAGE } from '@/Utils/events.js';
import api from '@/Utils/axios';

import {
  Image,
  Music,
  Video,
  File
} from 'lucide-react';
import { toast } from 'sonner';

export default function ChatArea({ chat, onBack, onToggleProfile, chatId, members, setUnreadMessages }) {

  const socket = getSocket();

  // console.log("cht=", chat);


  const [messages, setMessages] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // Message container
  const messagesContainerRef = useRef(null);

  // Tell useLayoutEffect why messages changed
  const shouldScrollToBottom = useRef(false);

  // Used when older messages are loaded
  const isLoadingOlderMessages = useRef(false);
  const previousScrollHeight = useRef(0);


  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sendingLoading, setSendingLoading] = useState(false);

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);


  const [selectedImage, setSelectedImage] = useState(null);


  // -----------------------------------
  // SEND MESSAGE
  // -----------------------------------

  const handleSubmit = () => {

    if (!message.trim()) return;

    socket.emit(NEW_MESSAGE, {
      chatId,
      members,
      message
    });

    setMessage("");
  };
  // -----------------------------------
  // RECEIVE NEW MESSAGE
  // -----------------------------------
  useEffect(() => {

    const handleNewMessage = ({ chatId: incomingChatId, message }) => {
      // if (incomingChatId.toString() !== chatId.toString()) return;

      shouldScrollToBottom.current = true;
      setMessages((prev) => [...prev, message]);

    };

    socket.on(NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage);
    };

  }, [socket, chatId]);
  // -----------------------------------
  // HANDLE SCROLL
  // -----------------------------------
  const handleScroll = (e) => {

    const container = e.currentTarget;

    if (container.scrollTop === 0 && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };
  // -----------------------------------
  // GET MESSAGES
  // -----------------------------------
  const getMessages = async (chatId, pageNumber = 1) => {

    try {

      setLoading(true);

      const response = await api.get(`chat/getChatMessages/${chatId}?page=${pageNumber}`);

      if (response.data.success) {

        const newMessages = response.data.messages;
        const container = messagesContainerRef.current;
        // -----------------------------------
        // FIRST PAGE
        // -----------------------------------
        if (pageNumber === 1) {

          setMessages(newMessages);
          //First load should go to bottom
          shouldScrollToBottom.current = true;
        }
        // ----------------------------------
        // OLDER MESSAGES
        // -----------------------------------
        else {

          if (container) {
            // Store current scroll height
            previousScrollHeight.current = container.scrollHeight;
          }
          // Tell layout effect that these are OLD messages
          isLoadingOlderMessages.current = true;
          setMessages((prev) => [...newMessages, ...prev]);

        }
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (chat) => {
    try {
      await api.post(`/chat/clearNotification/${chat._id}`);

      setUnreadMessages(prev => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // open chat...
    } catch (error) {
      console.log(error.response);
    }
  };

  // -----------------------------------
  // CHAT CHANGE
  // -----------------------------------
  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setPage(1);
    setHasMore(true);
    getMessages(chatId, 1);

    handleChatClick(chat);

  }, [chatId]);

  // -----------------------------------
  // LOAD NEXT PAGE
  // -----------------------------------
  useEffect(() => {
    if (page === 1 || !chatId) return;
    getMessages(chatId, page);
  }, [page, chatId]);

  // -----------------------------------
  // CONTROL SCROLL POSITION
  // -----------------------------------
  useLayoutEffect(() => {

    const container = messagesContainerRef.current;

    if (!container) return;
    // -----------------------------------
    // CASE 1:
    // NEW MESSAGE / FIRST LOAD
    // -----------------------------------
    if (shouldScrollToBottom.current) {

      container.scrollTop =
        container.scrollHeight;

      shouldScrollToBottom.current = false;

      return;
    }
    // -----------------------------------
    // CASE 2:
    // OLDER MESSAGES
    // -----------------------------------
    if (isLoadingOlderMessages.current) {

      const newScrollHeight =
        container.scrollHeight;

      const heightAdded =
        newScrollHeight -
        previousScrollHeight.current;
      /*
        Example:

        Before:
        scrollHeight = 1000

        After adding old messages:
        scrollHeight = 1500

        New content added = 500

        Move scrollbar down by 500
        so user stays at the same messages.
      */
      container.scrollTop =
        container.scrollTop + heightAdded;
      isLoadingOlderMessages.current = false;
    }
  }, [messages]);

  // -----------------------------------
  // NO CHAT SELECTED
  // -----------------------------------
  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#8696a0] p-6 text-center">

        <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
          <User size={32} className="text-[#00a884]"
          />
        </div>

        <p className="text-lg text-[#e9edef]">
          Select a user to start chatting
        </p>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length || files.length > 5) {

      toast.error("Minimum 1 and Maximum 5 Files Allowed")
    }

    setSelectedFiles(files);
    setShowAttachments(false);

    // console.log("Selected files:", files);

    sendAttachment(files)

  };
  // we are Here /';l[;-================================================================]
  const sendAttachment = async (files) => {

    try {
      setSendingLoading(true)
      toast.message("Sending ... Wait 🟢")
      const formData = new FormData();

      formData.append("chatId", chatId);

      files.forEach((file) => {
        formData.append("files", file);
      });
      // console.log("form Data = ", formData);

      const response = await api.post("/chat/message", formData)
      // console.log(response);

      if (response.data.success) {
        toast.success("Attchment Sent Successfully ✅")
      }
    } catch (error) {
      console.log(error.response);
      toast.error("failed to send Image ❌")
    } finally {
      setSendingLoading(false)
    }
  }

  return (

    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34] shrink-0">
        <div className="flex items-center gap-3">

          <button
            onClick={onBack}
            className="md:hidden text-[#aebac1] hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>

            <h2 className="text-sm font-medium text-[#e9edef]">
              {chat.name}
            </h2>

            <p className="text-xs text-[#00a884]">
              online
            </p>

          </div>

        </div>

        <button
          onClick={onToggleProfile}
          className="text-[#aebac1] hover:text-[#00a884] text-xs font-medium px-3 py-1.5 rounded-md bg-[#111b21]/50 border border-[#222d34]"
        >
          View Profile
        </button>

      </div>



      {/* MESSAGE STREAM */}

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto h-full p-4 space-y-4 bg-[#0b141a] scrollbar scrollbar-thumb-gray-700 scrollbar-thin"
      >
        {loading && (
          <div className="flex justify-center py-2">
            <div className="w-7 h-7 border-2 border-gray-300 border-t-green-800 rounded-full animate-spin" />
          </div>
        )}

        {messages.map((msg) => {

          // console.log(msg);
          // console.log("msg.sender._id", msg.sender._id);
          // console.log("chat._id", chat._id);

          const isMyMessage =
            msg.sender._id.toString() !== chat._id.toString()


          return (

            <div
              key={msg._id}
              className={`flex ${isMyMessage
                ? "justify-end"
                : "justify-start"
                }`}
            >

              <div
                className={`px-1 py-2 rounded-lg max-w-[80%] md:max-w-[60%] ${isMyMessage
                  ? "bg-[#005c4b]"
                  : "bg-[#202c33]"
                  }`}
              >

                {!isMyMessage && (

                  <span className="block text-xs font-medium text-[#00a884] mb-1">
                  </span>

                )}


                <p className="text-sm break-words whitespace-pre-wrap">
                  {msg.content}
                </p>
                {msg.attachments?.map((attachment) => (

                  <img
                    key={attachment._id}
                    src={attachment.url}
                    alt="Attachment"
                    className=" h-55 rounded-lg"
                    onClick={() => setSelectedImage(attachment.url)}
                  />

                ))}
                {selectedImage && (
                  <div
                    className="  fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"

                  >
                    <img
                      src={selectedImage}
                      alt="Full size"
                      className="max-w-full max-h-full object-contain rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <X size={40}
                      onClick={() => setSelectedImage(null)}
                      className="text-gray-300 hover:text-green-600 cursor-pointer absolute top-8 right-10 "
                    />
                  </div>
                )}


                <span className="block text-[10px] text-[#8696a0] text-right mt-1">

                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                </span>

              </div>

            </div>
          );

        })}
        {
          //   <div>
          //  {sendingLoading ? <Loader2 className='animate-spin' /> : <span></span> }
          //   </div>
        }

      </div>



      {/* INPUT */}

      <div className="p-3 bg-[#202c33] flex items-center gap-3 border-t border-[#222d34] shrink-0">

        <div className="relative">

          {showAttachments && (
            <div className="absolute bottom-12 left-0 bg-[#233138] rounded-xl shadow-xl p-2 w-40 space-y-1">

              <button
                onClick={() => imageInputRef.current.click()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a3942] text-[#e9edef]"
              >
                <Image size={18} />
                <span className="text-sm">Image</span>
              </button>

              <button
                onClick={() => audioInputRef.current.click()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a3942] text-[#e9edef]"
              >
                <Music size={18} />
                <span className="text-sm">Audio</span>
              </button>

              <button
                onClick={() => videoInputRef.current.click()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a3942] text-[#e9edef]"
              >
                <Video size={18} />
                <span className="text-sm">Video</span>
              </button>

              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a3942] text-[#e9edef]"
              >
                <File size={18} />
                <span className="text-sm">File</span>
              </button>

            </div>
          )}

          <button
            onClick={() => setShowAttachments(prev => !prev)}
            className="text-[#aebac1] hover:text-white"
          >
            <Paperclip size={20} />
          </button>

          {/* Hidden inputs */}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileChange}
          />

        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type Message Here..."
          className="flex-1 bg-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-[#00a884]"
        />

        <button
          onClick={handleSubmit}
          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029071] text-[#111b21] flex items-center justify-center transition-transform active:scale-95"
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  );
}