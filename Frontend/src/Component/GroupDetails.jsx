import { getSocket } from "@/Socket";
import api from "@/Utils/axios";
import {
    MoreVertical,
    Users,
    X,
    UserPlus,
    Trash2,
    LogOut,
} from "lucide-react"; import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddMembersDialog from "./AddMembersDialog";

export default function GroupDetails({ group, onClose, onRemoveMember, onAddMembers, selectedGroup, setSelectedGroup }) {
    const [memberMenu, setMemberMenu] = useState(null);
    const [showAddMembers, setShowAddMembers] = useState(false);


    const socket = getSocket()




    const creator = group.members.find(
        (member) => member._id === group.creator
    );

    // const handleAddMembers = () => {
    //     alert("hasn't been implemented yet")
    // };

    const handleRemoveMember = async (memberId) => {
        try {
            const response = await api.post("/chat/removeMember", {
                userId: memberId,
                chatId: selectedGroup._id
            })
            if (response.data.success) {
                toast.success(response.data.message)
            }
        } catch (error) {
            console.log(error.response);
            toast.error(error.message)
        }
    };

    const handleLeaveGroup = async () => {
        try {
            const response = await api.post(
                `/chat/leaveGroup/${selectedGroup._id}`
            );

            if (response.data.success) {
                toast.success(response.data.message);

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.log(error.response);
            toast.error(error.message);
        }
    };
    return (
        <>  <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[380px] flex-col border-l border-[#2a3942] bg-[#111b21] shadow-2xl">

            {/* HEADER */}

            <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#2a3942] bg-[#202c33] px-4">

                <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-[#2a3942] hover:text-white"
                >
                    <X size={21} />
                </button>

                <h2 className="text-lg font-medium">
                    Group Details
                </h2>

            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto">

                {/* GROUP IMAGE */}

                <div className="flex flex-col items-center px-5 py-7">

                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#202c33]">
                        <Users
                            size={55}
                            className="text-gray-500"
                        />
                    </div>

                    <h2 className="mt-4 text-xl font-semibold">
                        {group.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        {group.members.length} members
                    </p>
                </div>

                {/* CREATOR */}

                <div className="border-y border-[#202c33] bg-[#162127] px-5 py-4">

                    <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                        Created by
                    </p>

                    {creator && (
                        <div className="flex items-center gap-3">

                            <img
                                src={creator.avatar.url}
                                alt={creator.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />

                            <div>
                                <p className="text-sm font-medium">
                                    {creator.name}
                                </p>

                                <p className="text-xs text-[#00a884]">
                                    Group Creator
                                </p>
                            </div>

                        </div>
                    )}

                </div>

                {/* MEMBERS */}

                <div className="px-4 py-5">

                    <div className="mb-3 flex items-center justify-between">

                        <p className="text-sm font-medium text-gray-300">
                            Members
                        </p>

                        <span className="text-xs text-gray-500">
                            {selectedGroup.members.length}
                        </span>

                    </div>

                    {/* ADD MEMBERS */}

                    <button
                        onClick={() => setShowAddMembers(true)}
                        className=" cursor-pointer mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-[#202c33]"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884]">
                            <UserPlus size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-medium">
                                Add Members
                            </p>

                            <p className="text-xs text-gray-500">
                                Add people to this group
                            </p>
                        </div>
                    </button>

                    {/* MEMBER LIST */}

                    <div className="space-y-1">

                        {selectedGroup.members.map((member) => {
                            const isCreator =
                                member._id === selectedGroup.creator;

                            return (
                                <div
                                    key={member._id}
                                    className="relative flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#202c33]"
                                >

                                    <img
                                        src={member.avatar.url}
                                        alt={member.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />

                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-sm">
                                            {member.name}
                                        </p>

                                        {isCreator && (
                                            <p className="text-xs text-[#00a884]">
                                                Creator
                                            </p>
                                        )}

                                    </div>

                                    {/* CREATOR CANNOT BE REMOVED */}

                                    {!isCreator && (
                                        <button
                                            onClick={() =>
                                                setMemberMenu(
                                                    memberMenu ===
                                                        member._id
                                                        ? null
                                                        : member._id
                                                )
                                            }
                                            className="rounded-full p-2 text-gray-500 hover:bg-[#2a3942] hover:text-white"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    )}

                                    {/* REMOVE MENU */}

                                    {memberMenu === member._id && (
                                        <div className="absolute right-3 top-12 z-50 w-36 overflow-hidden rounded-lg border border-[#3b4a54] bg-[#202c33] shadow-xl">

                                            <button
                                                onClick={() => {
                                                    handleRemoveMember(
                                                        member._id
                                                    );

                                                    setMemberMenu(null);
                                                }}
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-[#2a3942]"
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>
                    <button
                        onClick={handleLeaveGroup}
                        className="  cursor-pointer flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-[#2a3942]"
                    >
                        <LogOut size={18} />
                        <span>Leave Group</span>
                    </button>
                </div>
            </div>
        </div >
            <AddMembersDialog
                open={showAddMembers}
                onClose={() => setShowAddMembers(false)}
                chatId={selectedGroup._id}
                members={selectedGroup.members}
            />

        </>

    );
}