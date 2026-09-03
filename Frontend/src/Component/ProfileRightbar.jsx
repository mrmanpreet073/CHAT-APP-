import React from 'react';
import { X, AtSign, User, Calendar } from 'lucide-react';

export default function ProfileRightbar({ chat, onClose }) {
  return (
    <div className="flex flex-col h-full p-6 bg-[#111b21] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8696a0]">User Details</h3>
        <button onClick={onClose} className="text-[#aebac1] hover:text-white"><X size={20} /></button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center border-b border-[#222d34] pb-6 mb-6">
        <img 
          src={chat.avatar} 
          alt={chat.name} 
          className="w-28 h-28 rounded-full object-cover border-4 border-[#202c33] shadow-xl mb-4" 
        />
        <h2 className="text-xl font-medium text-[#e9edef]">{chat.name}</h2>
        <p className="text-xs text-[#8696a0] mt-1 text-center">{chat.bio}</p>
      </div>

      {/* Info List */}
      <div className="space-y-6 text-sm">
        <div className="flex items-center gap-4 text-[#e9edef]">
          <AtSign size={20} className="text-[#8696a0]" />
          <div>
            <p className="text-xs text-[#8696a0]">Username</p>
            <p className="font-medium">{chat.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#e9edef]">
          <User size={20} className="text-[#8696a0]" />
          <div>
            <p className="text-xs text-[#8696a0]">Name</p>
            <p className="font-medium">{chat.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#e9edef]">
          <Calendar size={20} className="text-[#8696a0]" />
          <div>
            <p className="text-xs text-[#8696a0]">Joined</p>
            <p className="font-medium">{chat.joined}</p>
          </div>
        </div>
      </div>
    </div>
  );
}