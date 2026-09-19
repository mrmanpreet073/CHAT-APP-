import React, { useEffect, useState } from 'react';
import { Search, Plus, X, User } from 'lucide-react';
import api from '@/Utils/axios';
import { toast } from 'sonner';

export default function FindPeopleModal({ isOpen, onClose, onAddUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDisplay, setUserToDisplay] = useState([]);

  // Sample user list for testing (Replace with your backend API search result)
  // const mockUsers = [
  //   { id: 101, name: 'John Doe', username: '@johndoe', avatar: 'https://i.pravatar.cc/150?img=11' },
  //   { id: 103, name: 'Alice Smith', username: '@alicesmith', avatar: 'https://i.pravatar.cc/150?img=13' },
  // ];

  // Filter users based on input
  // const filteredUsers = mockUsers.filter(user =>
  //   user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   user.username.toLowerCase().includes(searchTerm.toLowerCase())
  // );


useEffect(() => {
  if (!searchTerm.trim()) return;

  const searchUser = async () => {
    try {
      const response = await api.get(
        `/user/searchUser?name=${searchTerm}`
      );

      if (response.data.success) {
        setUserToDisplay(response.data.users);
      }
    } catch (error) {
      console.error(error.response);
      toast.error(
        error.response?.data?.message || "User Search Failed"
      );
    }
  };

  searchUser();
}, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ">

      {/* Modal Container */}
      <div className="w-full max-w-md bg-[#202c33] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222d34]">
          <h2 className="text-lg font-medium text-[#e9edef] text-center w-full ml-6">
            Find People
          </h2>
          <button
            onClick={onClose}
            className="text-[#aebac1] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#222d34]">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-[#8696a0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full h-11 pl-10 pr-4 bg-[#111b21] border border-[#222d34] rounded-lg text-sm text-[#e9edef] placeholder-[#8696a0] outline-none focus:border-[#00a884] transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y scrollbar-thin scrollbar-thumb-gray-600 divide-[#222d34]/50 ">
          {userToDisplay.length > 0 ? (
            userToDisplay.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#111b21]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#222d34]"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-[#e9edef]">{user.name}</h3>
                    <p className="text-xs text-[#8696a0]">{user.username}</p>
                  </div>
                </div>

                {/* Plus Button */}
                <button
                  onClick={() => onAddUser(user)}
                  className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#029071] text-[#111b21] flex items-center justify-center transition-transform active:scale-95 shadow-md"
                  title="Add User"
                >
                  <Plus size={20} className="stroke-[2.5]" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[#8696a0] text-sm">
              No people found matching "{searchTerm}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
}