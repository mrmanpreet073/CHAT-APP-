import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import api from "@/Utils/axios";
import { toast } from "sonner";

export default function AddMembersDialog({
    open,
    onClose,
    chatId,
    members,
}) {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false)

    // Fetch frinds to add in group 
    useEffect(() => {
        if (!open) return;

        const fetchFriends = async () => {
            try {
                setLoading(true);

                const memberIds = members.map(member =>
                    member._id.toString()
                );

                const response = await api.post("/chat/getfriends", {
                    chatId,
                    memberIds,
                });

                if (response.data.success) {
                    setFriends(response.data.friends);
                }
            } catch (error) {
                console.log(error.response);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [open, chatId, members]);

    const handleAddMember = async (members, chatId, name = "User") => {

        try {
            setAdding(true)

            const response = await api.post("/chat/addMembers", {
                members: [members],
                chatId
            })

            if (response.data.success) {
                toast.success(`${name} Added To Group`)
            }
        } catch (error) {
            console.log(error.response);
        }
        finally {
            setAdding(false)
            onClose()
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#202c33] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2f3b43] px-5 py-4">
                    <div className="flex items-center gap-2">
                        <UserPlus size={20} className="text-[#00a884]" />
                        <h2 className="text-lg font-semibold text-white">
                            Add Members
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-[#2a3942] hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Friends */}
                <div className="max-h-96 overflow-y-auto p-3">

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-500 border-t-[#00a884]" />
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-sm text-gray-400">
                                No more friends to add
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {friends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-[#2a3942]"
                                >
                                    <img
                                        src={friend.avatar?.url}
                                        alt={friend.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-white">
                                            {friend.name}
                                        </p>

                                        {friend.bio && (
                                            <p className="truncate text-xs text-gray-400">
                                                {friend.bio}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        className="rounded-lg bg-[#00a884] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#06cf9b]"
                                        onClick={() => handleAddMember(friend._id, chatId, friend.name)}
                                    >
                                        {adding ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Adding...
                                            </div>
                                        ) : (
                                            "Add "
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-[#2f3b43] px-5 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-[#2a3942] hover:text-white"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}