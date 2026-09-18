import React, { useState } from 'react';
import { MessageSquareCode, Search, Plus, Users, Bell, LogOut, MessageSquare, Dot, User, LogIn, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/Redux/reducers/auth';

export default function Navbar({ onSearchClick, onNotificationClick, number, setNumber, showCreateGroup, setShowCreateGroup }) {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const user = useSelector((state) => state.auth.user);

  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#304946] shrink-0">

      {/* VibeTalk Logo & Brand Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#00a884] flex items-center justify-center text-[#111b21] shadow-md">
          <MessageSquare size={22} className="stroke-[2.5]" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white font-sans hidden md:block">
          Vibe<span className="text-[#00a884]">Talk</span>
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 text-[#aebac1]">
        <button onClick={onSearchClick} className="hover:text-[#00a884] transition-colors" title="Search People">
          <Search size={20} />
        </button>
        <button onClick={() => setShowCreateGroup(true)}

          className="hover:text-[#00a884] transition-colors" title="New Chat">
          <Plus size={20} />

        </button>
        <button className="hover:text-[#00a884] transition-colors" title="Groups">
          <Users size={20} onClick={() => navigate("/groups")} />
        </button>
        <button onClick={onNotificationClick} className="relative hover:text-[#00a884] transition-colors" title="Notifications">
          <div  >
            <Bell size={20} />

            {/* Notification Badge / Dot */}

            <span className={`${number === 0 ? "hidden" : "  absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00a884] text-[10px] font-bold text-[#111b21]"}`}>
              {number === 0 ? <p className='hidden'>{0}</p> : number}
            </span>
          </div>
        </button>

        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="ml-2"
          title={user?.name || "User"}
        >
          <img
            src={user?.avatar?.url || "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-image-icon-default-avatar-profile-icon-social-media-user-vector-image-209162840.jpg"}
            alt={user?.name || "User"}
            className="w-9 h-9 rounded-full object-cover"
          />
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute right-0 top-12 mt-2 w-44 rounded-lg bg-[#202c33] border border-gray-700 shadow-xl overflow-hidden z-50">

            {/* Profile */}
            <button
              onClick={() => {
                if (user) navigate("/profile");
                else navigate("/login");

                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#2a3942]"
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                if (user) navigate("/settings");
                else navigate("/login");

                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#2a3942]"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            {/* Login / Logout */}
            {user ? (
              <button
                onClick={() => {

                  localStorage.removeItem("accessToken");
                  dispatch(setUser(null));
                  // navigate("/login");
                  setShowMenu(false);

                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#2a3942]"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-[#2a3942]"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
            )}
          </div>
        )}
      </div>

    </header>
  );
}