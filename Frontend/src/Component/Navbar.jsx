import React from 'react';
import { MessageSquareCode, Search, Plus, Users, Bell, LogOut, MessageSquare, Dot } from 'lucide-react';

export default function Navbar({ onSearchClick, onNotificationClick, number, setNumber }) {
  return (
    <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#304946] shrink-0">

      {/* VibeTalk Logo & Brand Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#00a884] flex items-center justify-center text-[#111b21] shadow-md">
          <MessageSquare size={22} className="stroke-[2.5]" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white font-sans">
          Vibe<span className="text-[#00a884]">Talk</span>
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 text-[#aebac1]">
        <button onClick={onSearchClick} className="hover:text-[#00a884] transition-colors" title="Search People">
          <Search size={20} />
        </button>
        <button className="hover:text-[#00a884] transition-colors" title="New Chat">
          <Plus size={20} />
        </button>
        <button className="hover:text-[#00a884] transition-colors" title="Groups">
          <Users size={20} />
        </button>
        <button onClick={onNotificationClick} className="relative hover:text-[#00a884] transition-colors" title="Notifications">
          <div  >
            <Bell size={20} />

            {/* Notification Badge / Dot */}

            <span className={`${number === 0 ? "hidden":"  absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00a884] text-[10px] font-bold text-[#111b21]" }`}>
              {number === 0 ? <p className='hidden'>{0}</p> : number}
            </span>
          </div>
        </button>
        <button className="hover:text-red-400 transition-colors ml-2" title="Logout">
          <LogOut size={20} />
        </button>
      </div>

    </header>
  );
}