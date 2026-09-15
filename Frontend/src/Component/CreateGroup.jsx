import api from "@/Utils/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateGroup({ open, onClose, setShowCreateGroup, showCreateGroup }) {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [users, setUsers] = useState([]);


    const handleMemberSelect = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = () => {
        createGroup();
    };

    const createGroup = async () => {

        try {

            const response = await api.post("chat/new", {
                name: groupName,
                members: selectedMembers
            })

            if (response.data.success) {
                toast.success("Group Created Successfully ")
                setShowCreateGroup(false)
            }

        } catch (error) {
            console.log(error.message);
            toast.error(error.message)
        }

    }


    const fetchUsers = async () => {
        try {
            const response = await api.post("user/friends")
            if (response.data.success) {
                setUsers(response.data.friends)
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [open])

    if (!open) return null;


    // const users = [
    //     {
    //         _id: "1",
    //         name: "Rahul Sharma",
    //         avatar: "https://i.pravatar.cc/150?img=12",
    //     },
    //     {
    //         _id: "2",
    //         name: "Aman Kumar",
    //         avatar: "https://i.pravatar.cc/150?img=11",
    //     },
    //     {
    //         _id: "3",
    //         name: "Simran Kaur",
    //         avatar: "https://i.pravatar.cc/150?img=47",
    //     },
    //     {
    //         _id: "4",
    //         name: "Arjun Singh",
    //         avatar: "https://i.pravatar.cc/150?img=13",
    //     },
    //     {
    //         _id: "5",
    //         name: "Priya Verma",
    //         avatar: "https://i.pravatar.cc/150?img=32",
    //     },
    //     {
    //         _id: "6",
    //         name: "Karan Mehta",
    //         avatar: "https://i.pravatar.cc/150?img=14",
    //     },
    //     {
    //         _id: "7",
    //         name: "Neha Sharma",
    //         avatar: "https://i.pravatar.cc/150?img=44",
    //     },
    //     {
    //         _id: "8",
    //         name: "Rohit Singh",
    //         avatar: "https://i.pravatar.cc/150?img=15",
    //     },
    // ];


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl bg-[#202c33] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2f3b43] px-5 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        New Group
                    </h2>

                    <button

                        onClick={() => setShowCreateGroup(false)}
                        className="rounded-full px-2 text-xl text-gray-400 hover:bg-[#2a3942] hover:text-white"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">

                    <input
                        type="text"
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full rounded-lg border border-[#3b4a54] bg-[#111b21] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#00a884]"
                    />

                    <h3 className="mt-5 mb-3 text-sm font-medium text-gray-300">
                        Members
                    </h3>

                    {/* Scrollable users */}
                    <div className="max-h-64 overflow-y-auto">
                        {users.map((user) => {
                            const selected = selectedMembers.includes(user._id);

                            return (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#2a3942]"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user?.avatar}
                                            alt=""
                                            className="h-10 w-10 rounded-full object-cover"
                                        />

                                        <span className="text-white">
                                            {user.name}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleMemberSelect(user._id)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a884] text-white"
                                    >
                                        {selected ? "✓" : "+"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-[#2f3b43] px-5 py-4">

                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-[#2a3942]"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={
                            !groupName.trim() ||
                            selectedMembers.length === 0
                        }
                        onClick={handleCreateGroup}
                        className="rounded-lg bg-[#00a884] px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Create
                    </button>

                </div>

            </div>
        </div>
    );
}