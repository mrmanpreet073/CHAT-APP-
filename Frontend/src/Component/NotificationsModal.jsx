import React, { useEffect, useState } from 'react';
import { X, Check, X as RejectIcon, Bell } from 'lucide-react';
import api from '@/Utils/axios';
import { toast } from 'sonner';
import { getSocket } from '@/Socket.jsx';

export default function NotificationsModal({ isOpen, onClose, onAccept, onReject, requests, setRequests, number, setNumber }) {

  // const [requests, setRequests] = useState([])
  const [filterRequests, setFilterRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const socket = getSocket();

  // setNumber(requests.length)

  useEffect(() => {

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await api.post("/user/notification");
        // Accessing response array directly
        console.log(response)
        setRequests(response.data.allRequests || []);
        console.log("Reload response = ", response);

        setNumber(response.data.allRequests.length)

      } catch (error) {
        console.error(error.response);
        // toast.error(
        //   error.response?.data?.message || "Failed to load notifications"
        // );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

  }, [])

  useEffect(() => {
    const handleNotification = (data) => {
      console.log("Notification Received:", data);

      setRequests((prev) => {
        const updatedRequests = [...prev, data.request];

        setNumber(updatedRequests.length);

        return updatedRequests;
      });
    };

    socket.on("NOTIFICATION", handleNotification);

    return () => {
      socket.off("NOTIFICATION", handleNotification);
    };
  }, [socket]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

      {/* Modal Container */}
      <div className="w-full max-w-md bg-[#202c33] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222d34]">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#00a884]" />
            <h2 className="text-lg font-medium text-[#e9edef]">
              Notifications
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#aebac1] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#222d34]/50">
          {requests && requests.length > 0 ? (
            requests.map((req) => (
              <div
                key={req._id || req.id}
                className="flex items-center justify-between p-3.5 hover:bg-[#111b21]/40 transition-colors"
              >
                {/* Sender Info with Avatar Handling */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {req.sender?.avatar?.url ? (
                    <img
                      src={req.sender.avatar}
                      alt={req.sender.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#222d34] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#00a884] flex items-center justify-center text-[#111b21] font-bold text-sm uppercase shrink-0">
                      {req.sender?.name?.charAt(0) || "U"}
                    </div>
                  )}

                  <div className="truncate">
                    <h3 className="text-sm font-medium text-[#e9edef] truncate">
                      {req.sender?.name}
                    </h3>
                    <p className="text-xs text-[#8696a0] truncate">
                      sent you a friend request
                    </p>
                  </div>
                </div>

                {/* Accept / Reject Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAccept(req._id || req.id)}
                    className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#029071] text-[#111b21] flex items-center justify-center transition-transform active:scale-95 shadow-md"
                    title="Accept Request"
                  >
                    <Check size={18} className="stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => onReject(req._id || req.id)}
                    className="w-9 h-9 rounded-full bg-[#2a3942] hover:bg-red-500/20 text-[#aebac1] hover:text-red-400 border border-[#222d34] flex items-center justify-center transition-colors active:scale-95"
                    title="Reject Request"
                  >
                    <RejectIcon size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#8696a0] text-sm">
              No pending requests
            </div>
          )}
        </div>

      </div>
    </div>
  );
}