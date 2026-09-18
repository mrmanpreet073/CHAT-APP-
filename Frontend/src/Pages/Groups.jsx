import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Users,
  X,
  UserPlus,
  Trash2,
} from "lucide-react";
import api from "@/Utils/axios";
import { getSocket } from "@/Socket";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "@/Utils/events";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GroupDetails from "@/Component/GroupDetails";
import Navbar from "@/Component/Navbar";
import { toast } from "sonner";

const sampleGroups = [
  {
    _id: "6aa84c0ba7b26048e1dfef6a",
    name: "Girlfriends",
    groupChat: true,
    creator: "6a948e17881d95ed06a577ed",

    members: [
      {
        _id: "6a99ac3b38a02ffa5fd1dea2",
        name: "Simran Kaur",
        avatar: "https://i.pravatar.cc/150?img=47",
      },
      {
        _id: "6a99ac3b38a02ffa5fd1de9d",
        name: "Priya Verma",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      {
        _id: "6a948e17881d95ed06a577ed",
        name: "Manpreet Singh",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
    ],
  },

  {
    _id: "g2",
    name: "Developers",
    groupChat: true,
    creator: "u1",

    members: [
      {
        _id: "u1",
        name: "Rahul Sharma",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      {
        _id: "u2",
        name: "Aman Kumar",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
      {
        _id: "u3",
        name: "Arjun Singh",
        avatar: "https://i.pravatar.cc/150?img=13",
      },
      {
        _id: "u4",
        name: "Karan Mehta",
        avatar: "https://i.pravatar.cc/150?img=14",
      },
    ],
  },

  {
    _id: "g3",
    name: "Gaming Squad",
    groupChat: true,
    creator: "u5",

    members: [
      {
        _id: "u5",
        name: "Rohit Singh",
        avatar: "https://i.pravatar.cc/150?img=15",
      },
      {
        _id: "u6",
        name: "Arjun Singh",
        avatar: "https://i.pravatar.cc/150?img=13",
      },
      {
        _id: "u7",
        name: "Karan Mehta",
        avatar: "https://i.pravatar.cc/150?img=14",
      },
    ],
  },

  {
    _id: "g4",
    name: "Project Team",
    groupChat: true,
    creator: "u8",

    members: [
      {
        _id: "u8",
        name: "Priya Verma",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      {
        _id: "u9",
        name: "Aman Kumar",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
      {
        _id: "u10",
        name: "Neha Sharma",
        avatar: "https://i.pravatar.cc/150?img=44",
      },
    ],
  },

  {
    _id: "g5",
    name: "Family Group",
    groupChat: true,
    creator: "u11",

    members: [
      {
        _id: "u11",
        name: "Dad",
        avatar: "https://i.pravatar.cc/150?img=13",
      },
      {
        _id: "u12",
        name: "Mom",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      {
        _id: "u13",
        name: "Brother",
        avatar: "https://i.pravatar.cc/150?img=14",
      },
    ],
  },
];

const sampleMessages = {
  "6aa84c0ba7b26048e1dfef6a": [
    {
      _id: "m1",
      sender: "Simran Kaur",
      content: "Hey everyone ❤️",
      time: "10:20 AM",
      mine: false,
    },
    {
      _id: "m2",
      sender: "Manpreet Singh",
      content: "Hey 👋",
      time: "10:21 AM",
      mine: true,
    },
    {
      _id: "m3",
      sender: "Priya Verma",
      content: "Are we meeting tomorrow?",
      time: "10:23 AM",
      mine: false,
    },
    {
      _id: "m4",
      sender: "Manpreet Singh",
      content: "Yes, around 11 AM.",
      time: "10:24 AM",
      mine: true,
    },
  ],

  g2: [
    {
      _id: "m5",
      sender: "Aman Kumar",
      content: "Did everyone pull the latest code?",
      time: "09:30 AM",
      mine: false,
    },
    {
      _id: "m6",
      sender: "You",
      content: "Yes, working on it.",
      time: "09:32 AM",
      mine: true,
    },
  ],

  g3: [
    {
      _id: "m7",
      sender: "Arjun Singh",
      content: "Anyone online?",
      time: "08:15 PM",
      mine: false,
    },
    {
      _id: "m8",
      sender: "You",
      content: "I'm online 🎮",
      time: "08:16 PM",
      mine: true,
    },
  ],

  g4: [
    {
      _id: "m9",
      sender: "Priya Verma",
      content: "Meeting at 5 PM.",
      time: "02:10 PM",
      mine: false,
    },
  ],

  g5: [
    {
      _id: "m10",
      sender: "Mom",
      content: "Dinner is ready.",
      time: "08:30 PM",
      mine: false,
    },
  ],
};


export default function Groups() {
  const [groups, setGroups] = useState(sampleGroups);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [messagess, setMessagess] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);


  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef(null);

  const shouldScrollToBottom = useRef(false);
  const isLoadingOlderMessages = useRef(false);
  const previousScrollHeight = useRef(0);

  const [unreadMessages, setUnreadMessages] = useState({});

  const navigate = useNavigate();

  const socket = getSocket();

  const user = useSelector((state) => state.auth.user);

  // Send Messages
  const handleSendMessage = () => {
    if (!message.trim()) return;

    socket.emit(NEW_MESSAGE, {
      chatId: selectedGroup._id,
      members: selectedGroup?.members,
      message
    });

    setMessage("");
  };

  // Handle New Messages
  useEffect(() => {

    const handleNewMessage = ({ chatId, message }) => {

      // console.log("Message Received:", message);

      // This message is NEW,
      // so after rendering we want to go bottom.
      shouldScrollToBottom.current = true;

      setMessagess((prev) => [
        ...prev,
        message
      ]);
    };

    socket.on(NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage);
    };

  }, [socket]);


  // fetching groups 
  const fetchGroups = async () => {
    try {
      const response = await api.get("chat/myGroups")

      if (response.data.success) {
        setGroups(response.data.groups)
      }
    } catch (error) {
      console.log(error.message);

    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleScroll = (e) => {
    const container = e.currentTarget;

    if (
      container.scrollTop === 0 &&
      hasMore &&
      !loading
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page === 1 || !selectedGroup?._id) return;

    getMessages(selectedGroup._id, page);
  }, [page, selectedGroup]);

  useEffect(() => {
    if (!selectedGroup?._id) return;

    setMessagess([]);
    setPage(1);
    setHasMore(true);

    getMessages(selectedGroup._id, 1);
    handleChatClick(selectedGroup._id)
  }, [selectedGroup]);

  // remove user from chatlist of group real time 
  useEffect(() => {
    const handleGroupUpdated = ({ chatId, members }) => {
      if (chatId !== selectedGroup._id) return;

      setSelectedGroup((prev) => ({
        ...prev,
        members,
      }));
    };

    socket.on("GROUP_UPDATED", handleGroupUpdated);



    return () => {
      socket.off("GROUP_UPDATED", handleGroupUpdated);
    };
  }, [socket, selectedGroup?._id]);

  // remove Group from the user who has been removed in realtime 
  useEffect(() => {
    const handleRemovedFromGroup = ({ chatId }) => {
      setGroups((prev) =>
        prev.filter((group) => group._id !== chatId)
      );

      setSelectedGroup((prev) =>
        prev?._id === chatId ? null : prev
      );

      toast.info("You were removed from the group");
    };

    socket.on("REMOVED_FROM_GROUP", handleRemovedFromGroup);

    return () => {
      socket.off("REMOVED_FROM_GROUP", handleRemovedFromGroup);
    };
  }, [socket]);

  const getMessages = async (chatId, pageNumber = 1) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/chat/getChatMessages/${chatId}?page=${pageNumber}`
      );

      if (response.data.success) {
        const newMessages = response.data.messages;

        // FIRST PAGE
        if (pageNumber === 1) {
          setMessagess(newMessages);

          // Initial opening → scroll to bottom
          shouldScrollToBottom.current = true;
        }

        // OLDER MESSAGES
        else {
          const container = messagesContainerRef.current;

          if (container) {
            previousScrollHeight.current = container.scrollHeight;
          }

          isLoadingOlderMessages.current = true;

          setMessagess((prev) => [...newMessages, ...prev]);
        }

        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };


  const messages = selectedGroup
    ? sampleMessages[selectedGroup._id] || []
    : [];








  useLayoutEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    // First page / new message
    if (shouldScrollToBottom.current) {
      container.scrollTop = container.scrollHeight;

      shouldScrollToBottom.current = false;

      return;
    }

    // Older messages loaded
    if (isLoadingOlderMessages.current) {
      const newScrollHeight = container.scrollHeight;

      const heightAdded =
        newScrollHeight - previousScrollHeight.current;

      container.scrollTop =
        container.scrollTop + heightAdded;

      isLoadingOlderMessages.current = false;
    }
  }, [messages]);




  // Notification 

  // Get Notification of groups
  useEffect(() => {
    const handleMessageAlert = ({ chatId }) => {
      setUnreadMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || 0) + 1,
      }));
    };

    socket.on(NEW_MESSAGE_ALERT, handleMessageAlert);

    return () => {
      socket.off(NEW_MESSAGE_ALERT, handleMessageAlert);
    };
  }, [socket]);

  // get Notification on page load
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


  // remove notification on read  realTime
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


  // remove notification on read 
  const handleChatClick = async (chat) => {
    try {
      await api.post(`/chat/clearNotification/${chat}`);

      setUnreadMessages(prev => {
        const updated = { ...prev };
        delete updated[chat];
        return updated;
      });

      // open chat...
    } catch (error) {
      console.log(error.response);
    }
  };


  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setShowDetails(false);

    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[group._id];
      return updated;
    });
  };


  console.log(groups);
  



  return (

    <>

      <div className="relative flex h-screen w-full overflow-hidden bg-[#111b21] text-white">

        {/* GROUP LIST */}

        <div
          className={`h-full w-full shrink-0 border-r border-[#2a3942] md:w-[350px] ${selectedGroup ? "hidden md:block" : "block"
            }`}
        >
          <div className="flex h-[72px] items-center justify-between bg-[#202c33] px-5">
            <div>
              <ArrowLeft onClick={() => navigate("/ChatPage")} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                Groups
              </h1>

              <p className="text-sm text-gray-400">
                {groups.length} groups
              </p>
            </div>

            <Users
              size={24}
              className="text-gray-400"
            />
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto">
            {groups.map((group) => (
              
              <button
                key={group._id}
                onClick={() => handleGroupClick(group)}
                className={`flex w-full items-center gap-3 border-b border-[#202c33] px-4 py-3 text-left hover:bg-[#202c33] ${selectedGroup?._id === group._id
                  ? "bg-[#2a3942]"
                  : ""
                  }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a3942]">
                 <img src={group.image?.url} alt="" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-medium">
                      {group.name}
                    </h3>

                    {unreadMessages[group._id] > 0 && (
                      <span className="rounded-full bg-[#00a884] px-2 py-1 text-xs text-white">
                        {unreadMessages[group._id]}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-sm text-gray-400">
                    {group.members.length} members
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}

        <div
          className={`flex h-full min-w-0 flex-1 flex-col ${selectedGroup ? "flex" : "hidden md:flex"
            }`}
        >
          {!selectedGroup ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
              <Users
                size={70}
                className="mb-5 opacity-30"
              />

              <h2 className="text-2xl text-gray-400">
                Select a group
              </h2>

              <p className="mt-2 text-sm">
                Choose a group to start chatting
              </p>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}

              <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#2a3942] bg-[#202c33] px-4">

                <button
                  onClick={() => setSelectedGroup(null)}
                  className="md:hidden"
                >
                  <ArrowLeft size={22} />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2a3942]">
                  <Users
                    size={20}
                    className="text-gray-400"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium">
                    {selectedGroup.name}
                  </h2>

                  <p className="text-xs text-gray-400">
                    {selectedGroup.members.length} members
                  </p>
                </div>

                {/* GROUP DETAILS */}

                <button
                  onClick={() => setShowDetails(true)}
                  className="rounded-full p-2 text-gray-400 hover:bg-[#2a3942] hover:text-white"
                  title="Group details"
                >
                  <MoreVertical size={21} />
                </button>
              </div>

              {/* MESSAGES */}

              <div
                className="min-h-0 flex-1 overflow-y-auto bg-[#0b141a] p-4"
                ref={messagesContainerRef}
                onScroll={handleScroll}
              >
                <div className="mx-auto max-w-4xl space-y-2">

                  {/* Loading older messages */}
                  {loading && page > 1 && (
                    <div className="flex justify-center py-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-[#00a884]" />
                    </div>
                  )}

                  {
                    messagess.map((msg) => {
                      if (msg.messageType === "system") {
                        return (
                          <div
                            key={msg._id}
                            className="flex justify-center my-3"
                          >
                            <div className="rounded-lg bg-[#182229] px-4 py-2 text-center text-xs text-gray-400">
                              {msg.content}
                            </div>
                          </div>
                        );
                      }

                      const isMine = msg.sender._id === user.id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"
                            }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${isMine ? "bg-[#005c4b]" : "bg-[#202c33]"
                              }`}
                          >
                            {!isMine && (
                              <p className="mb-1 text-xs font-medium text-[#00a884]">
                                {msg.sender.name}
                              </p>
                            )}

                            <p className="text-sm">
                              {msg.content}
                            </p>

                            <p className="mt-1 text-right text-[10px] text-gray-400">
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  }

                </div>
              </div>
              {/* INPUT */}

              <div className="shrink-0 border-t border-[#2a3942] bg-[#202c33] p-3">
                <div className="mx-auto flex max-w-4xl items-center gap-2">

                  <input
                    type="text"
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message"
                    className="min-w-0 flex-1 rounded-lg bg-[#2a3942] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400"
                  />

                  <button
                    onClick={handleSendMessage}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] hover:bg-[#06cf9b]"
                  >
                    <Send size={19} />
                  </button>

                </div>
              </div>
            </>
          )}
        </div>

        {/* GROUP DETAILS */}

        {showDetails && selectedGroup && (
          <GroupDetails
            group={selectedGroup}
            onClose={() => setShowDetails(false)}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          // onRemoveMember={handleRemoveMember}
          // onAddMembers={handleAddMembers}
          />
        )}
      </div>
    </>
  );
}


