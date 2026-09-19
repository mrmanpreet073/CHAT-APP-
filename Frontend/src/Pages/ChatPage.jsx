import React, { useEffect, useState } from 'react';
import Navbar from '../Component/Navbar.jsx';
import Sidebar from '../Component/Sidebar.jsx';
import ChatArea from '../Component/ChatArea.jsx';
import ProfileRightbar from '../Component/ProfileRightbar.jsx';
import FindPeopleModal from '@/Component/FindPeopleModal.jsx';
import { toast } from 'sonner';
import NotificationsModal from '@/Component/NotificationsModal.jsx';
import api from '@/Utils/axios.js';
import { getSocket } from '@/Socket.jsx';
import CreateGroup from '@/Component/CreateGroup.jsx';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [requests, setRequests] = useState([])
  const [chats, setChats] = useState([])
  const [chatId, setChatId] = useState(null);
  const [members, setMembers] = useState([]);

  const [number, setNumber] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState({});

  // group Dialoag 

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);



  const socket = getSocket();
  // console.log("selected Chat", selectedChat);

  // console.log("SocketId",socket?.id);
  // const chatId = selectedChat._id


  const getChatId = async (userId) => {
    try {
      const response = await api.post(`/chat/getChatId/${userId}`);

      if (response.data.success) {
        setChatId(response.data.chatId);
        setMembers(response.data.members);
      }
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    if (selectedChat?._id) {
      getChatId(selectedChat._id);
    }
  }, [selectedChat]);


  const handleAcceptRequest = async (requestId) => {

    try {

      const response = await api.post("/user/requestResponse", {
        requestId,
        accept: true
      })
      // console.log(response);

      if (response.data.success) {
        // 2. Remove the request from local state so it disappears instantly
        setRequests((prevRequests) =>
          prevRequests.filter((req) => (req._id || req.id) !== requestId))
        toast.success(response.data.message)
      }

    } catch (error) {
      console.log(error.response);
      toast.error(error.message)
    }
  };

  const handleRejectRequest = async (requestId) => {
    // Perform your API call here: e.g., await api.put("/request/reject", { requestId })
    // setRequests((prev) => prev.filter((req) => req._id !== requestId));
    // toast.error("Request rejected.");
  };

  const handleAddUser = async (user) => {
    // Perform your backend add request or state update here
    try {
      const response = await api.post("/user/sendRequest", { userId: user._id });
      if (response.data.success) {
        toast.success(`Request Sent to ${user.name} `);
      }

    } catch (error) {
      // console.log(error.response);
      toast.error(error.message)
      // console.log(error);

    }
    setIsSearchOpen(false);
  };

 return (
    <div className="  flex flex-col h-screen bg-[#111b21] text-[#e9edef] overflow-hidden font-sans">

      {/* Top Navbar */}
      <Navbar
        onSearchClick={() => setIsSearchOpen(true)}
        onNotificationClick={() => setIsNotificationOpen(true)}
        number={number}
        setNumber={setNumber}
        setShowCreateGroup={setShowCreateGroup}
        showCreateGroup={showCreateGroup}

      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (Full width on mobile if no chat is selected, fixed width on desktop) */}
        <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-[#222d34] flex-shrink-0 bg-[#111b21] ${selectedChat ? 'hidden md:block' : 'block'
          }`}>
          <Sidebar
            chats={chats}
            setChats={setChats}
            selectedChat={selectedChat}
            setSelectedChat={ setSelectedChat}
            chatId={chatId}
            setUnreadMessages={setUnreadMessages}
            unreadMessages={unreadMessages}
            setIsSearchOpen={setIsSearchOpen}
          />
        </div>

        {/* Main Chat Area (Full width on mobile when chat is selected) */}
        <div className={`flex-1 flex flex-col bg-[#0b141a] relative ${!selectedChat ? 'hidden md:flex' : 'flex'
          }`}>
          <ChatArea
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
            onToggleProfile={() => setShowProfile(!showProfile)}
            chatId={chatId}
            members={members}
            setUnreadMessages={setUnreadMessages}
          />
        </div>

        {/* Rightbar Profile Drawer */}
        {showProfile && selectedChat && (
          <div className="w-full md:w-[300px] lg:w-[350px] border-l border-[#222d34] bg-[#111b21] absolute right-0 top-0 bottom-0 z-20 md:relative">
            <ProfileRightbar
              chat={selectedChat}
              onClose={() => setShowProfile(false)}
            />
          </div>
        )}
      </div>

      <FindPeopleModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddUser={handleAddUser}
      />
      <NotificationsModal
        requests={requests}
        setRequests={setRequests}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        number={number}
        setNumber={setNumber}
      />
      <CreateGroup
        open={showCreateGroup}
        // onClose={() => setShowCreateGroup(false)}
        setShowCreateGroup={setShowCreateGroup}
        showCreateGroup={showCreateGroup}
      />
    </div>
  );
}