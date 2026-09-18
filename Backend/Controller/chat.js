import mongoose from "mongoose";
import { Chat } from "../Models/chat.js";
import { Message } from "../Models/message.js";
import { User } from "../Models/user.js";
import { uploadFilesToCloudinary, uploadToCloudinary } from "../Utils/cloudinary.js";
import { io, userSocketIDs } from "../index.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "../Utils/events.js";
import { Notification } from "../Models/Notification.js";
import { log } from "console";
import { getSockets } from "../Utils/helper.js";

export const newGroupChat = async (req, res) => {
    try {
        const { name, members } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Group name is required"
            });
        }

        if (!members || members.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Must have at least 3 members"
            });
        }

        let image = {
            public_id: null,
            url: null,
        };

        if (req.file) {
            image = await uploadToCloudinary(req.file.buffer);
        }

        const allMembers = [...members, req.user._id];

        const groupChat = await Chat.create({
            name,
            image,
            groupChat: true,
            members: allMembers,
            creator: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Group Chat Created",
            groupChat
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyChats = async (req, res) => {

    try {

        const chats = await Chat.find({ members: req.user._id }).populate("members", "name avatar")

        return res.status(201).json({
            success: true,
            message: "Chat fetched successfully",
            chats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

};

export const getMyGroups = async (req, res) => {

    try {
        const chats = await Chat.find({
            members: req.user._id,
            groupChat: true,
            // creator: req.user._id,
        }).populate("members", "name avatar");

        const groups = chats.map(({ members, _id, groupChat, name, creator, image }) => ({
            _id,
            groupChat,
            members,
            name,
            creator,
            image,
        }));

        return res.status(200).json({
            success: true,
            groups,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const addMembers = async (req, res, next) => {
    try {
        const { chatId, members } = req.body;

        // --------------------------------------------------
        // 1. Find the group chat
        // --------------------------------------------------

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Make sure this is a group chat
        if (!chat.groupChat) {
            return res.status(400).json({
                success: false,
                message: "This is not a group chat",
            });
        }

        const remainingMembers = chat.members

        // Only the group creator can add members
        if (chat.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to add members",
            });
        }


        // --------------------------------------------------
        // 2. Remove duplicate IDs from the request
        // --------------------------------------------------

        const uniqueMemberIds = [...new Set(members.map((id) => id.toString()))];


        // --------------------------------------------------
        // 3. Find all requested users
        // --------------------------------------------------

        const allNewMembers = await Promise.all(uniqueMemberIds.map((id) => User.findById(id, "name")));


        // --------------------------------------------------
        // 4. Check if all users exist bcz findById returns null for non-existing users
        // --------------------------------------------------

        const invalidUser = allNewMembers.find((user) => !user);

        if (invalidUser) {
            return res.status(404).json({
                success: false,
                message: "One or more users not found",
            });
        }


        // --------------------------------------------------
        // 5. Check if any user is already a group member
        // --------------------------------------------------

        const alreadyMember = allNewMembers.find((user) =>
            chat.members.some((member) => member.toString() === user._id.toString()));
        // .some() returns true if at least one element satisfies the condition .find() returns that element if found, otherwise undefined

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: `${alreadyMember.name} is already a member of this group`,
            });
        }


        // --------------------------------------------------
        // 6. Check group member limit
        // --------------------------------------------------

        if (chat.members.length + allNewMembers.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Group members limit reached",
            });
        }


        // --------------------------------------------------
        // 7. Add the new members
        // --------------------------------------------------

        const newMemberIds = allNewMembers.map(
            (user) => user._id
        );

        chat.members.push(...newMemberIds);

        await chat.save();


        // --------------------------------------------------
        // 8. Get names for notification
        // --------------------------------------------------

        const allUsersName = allNewMembers
            .map((user) => user.name)
            .join(", ");


        const user = await User.findById(members[0], "name");



        const addMessage = await Message.create({
            sender: req.user._id,
            chat: chatId,
            content: `${user.name} Added To This group by ${req.user.name}`,
            messageType: "system"
        });

        const messageForRealTime = {
            _id: addMessage._id,
            content: addMessage.content,
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            messageType: "system",
            createdAt: addMessage.createdAt,
        };

        const membersSocket = getSockets(remainingMembers);

        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });

        const updatedChat = await Chat.findById(chatId)
            .populate("members", "name avatar")
        // .populate("creator", "name avatar");

        io.to(membersSocket).emit("GROUP_UPDATED", {
            chatId: updatedChat._id,
            members: updatedChat.members,
        });

        return res.status(200).json({
            success: true,
            message: "Members added successfully",
        });

    } catch (error) {
        // console.error("addMembers:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { userId, chatId } = req.body;

        const [chat, userThatWillBeRemoved] = await Promise.all([
            Chat.findById(chatId),
            User.findById(userId, "name"),
        ]);

        // Chat exists?
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // User exists?
        if (!userThatWillBeRemoved) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Is this a group?
        if (!chat.groupChat) {
            return res.status(400).json({
                success: false,
                message: "This is not a group chat"
            });
        }

        // Is current user the creator?
        if (chat.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to remove members"
            });
        }

        // Minimum 3 members
        if (chat.members.length <= 3) {
            return res.status(400).json({
                success: false,
                message: "Group must have at least 3 members"
            });
        }

        // Check whether target user is actually a member
        const isMember = chat.members.some(
            (member) => member.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of this group"
            });

        }

        // Save all members before removing the user
        const allChatMembers = chat.members.map(
            (member) => member.toString()
        );

        // Remove member
        chat.members = chat.members.filter(
            (member) => member.toString() !== userId.toString()
        );

        await chat.save();

        const removedUserSocketId = userSocketIDs.get(userId.toString());

        if (removedUserSocketId) {
            io.to(removedUserSocketId).emit("REMOVED_FROM_GROUP", {
                chatId,
            });
        }

        const updatedChat = await Chat.findById(chatId)
            .populate("members", "name avatar")

        const memberIds = updatedChat.members.map(member => member._id.toString());

        const membersSocket = getSockets(memberIds);

        io.to(membersSocket).emit("GROUP_UPDATED", {
            chatId: updatedChat._id,
            members: updatedChat.members,
        });



        return res.status(200).json({
            success: true,
            message: `${userThatWillBeRemoved.name} has been removed from the group`,
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const leaveGroup = async (req, res) => {

    try {
        const chatId = req.params.id;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (!chat.groupChat) {
            return res.status(400).json({
                success: false,
                message: "This is not a group chat"
            });
        }

        const isUserMember = chat.members.some(
            (member) => member.toString() === req.user._id.toString()
        );

        if (!isUserMember) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of this group"
            });
        }

        const remainingMembers = chat.members.filter(
            (member) => member.toString() !== req.user._id.toString()
        );

        // if (remainingMembers.length < 3) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Group must have at least 3 members"
        //     });
        // }

        if (chat.creator.toString() === req.user._id.toString()) {

            chat.creator = remainingMembers[0];
        }

        chat.members = remainingMembers;

        const user = await User.findById(req.user._id, "name");

        await chat.save();


        const leaveMessage = await Message.create({
            sender: req.user._id,
            chat: chatId,
            content: `${user.name} left the group`,
            messageType: "system"
        });

        const messageForRealTime = {
            _id: leaveMessage._id,
            content: leaveMessage.content,
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            messageType: "system",
            createdAt: leaveMessage.createdAt,
        };

        const membersSocket = getSockets(remainingMembers);

        // console.log("remainingMembers ", remainingMembers);
        // console.log("member socket ", membersSocket);


        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });

        const updatedChat = await Chat.findById(chatId)
            .populate("members", "name avatar")
        // .populate("creator", "name avatar");

        io.to(membersSocket).emit("GROUP_UPDATED", {
            chatId: updatedChat._id,
            members: updatedChat.members,
        });

        return res.status(200).json({
            success: true,
            message: " Leave Group Successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const sendAttachments = async (req, res) => {

    try {

        const { chatId } = req.body;

        const files = req.files || [];

        // console.log("files = ", req.files);


        if (files.length < 1) {
            return res.status(400).json({
                success: false,
                message: "Please Upload Attachments"
            });
        }

        if (files.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Files Can't be more than 5"
            });
        }

        const [chat, me] = await Promise.all([
            Chat.findById(chatId),
            User.findById(req.user._id, "name"),
        ]);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (files.length < 1) {
            return res.status(400).json({
                success: false,
                message: "Please provide attachments"
            });
        }


        //   Upload files here
        const attachments = await uploadFilesToCloudinary(files);

        const messageForDB = {
            content: "",
            attachments,
            sender: req.user._id,
            chat: chatId,
        };

        const message = await Message.create(messageForDB);

        const messageForRealTime = {
            _id: message._id,
            content: message.content,
            attachments: message.attachments,
            sender: {
                _id: me._id,
                name: me.name,
            },
            chat: chatId,
            createdAt: message.createdAt,
        };

        const membersSocket = chat.members
            .map(member => userSocketIDs.get(member.toString()))
            .filter(Boolean);

        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        });


        return res.status(200).json({
            success: true,
            message: "Upload successfull",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getChatDetails = async (req, res) => {

    try {
        const chatId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID",
            });
        }

        if (req.query.populate === "true") {
            const chat = await Chat.findById(chatId)
                .populate("members", "name avatar")
                .lean();



            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }

            chat.members = chat.members.map(({ _id, name, avatar }) => ({
                _id,
                name,
                avatar: avatar.url,
            }));

            return res.status(200).json({
                success: true,
                chat,
            });

        } else {

            const chat = await Chat.findById(req.params.id);
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }
            return res.status(200).json({
                success: true,
                chat,
            });

        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

export const renameGroup = async (req, res) => {
    try {
        const chatId = req.params.id;
        const { name } = req.body;

        // Find the group chat
        const chat = await Chat.findById(chatId);

        // Check if chat exists
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Check if this is a group chat
        if (!chat.groupChat) {
            return res.status(400).json({
                success: false,
                message: "This is not a group chat",
            });
        }

        // Only the group creator can rename the group
        if (
            chat.creator.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to rename the group",
            });
        }

        // Validate group name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Group name is required",
            });
        }

        // Update group name
        chat.name = name.trim();

        // Save changes
        await chat.save();

        // Tell group members to refresh their chat list
        // emitEvent(req, REFETCH_CHATS, chat.members);

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Group renamed successfully",
        });

    } catch (error) {
        console.error("renameGroup:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// export const deleteChat = async (req, res) => {
//     try {
//         const chatId = req.params.id;

//         // Find the chat
//         const chat = await Chat.findById(chatId);

//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found",
//             });
//         }

//         // Only the group creator can delete a group
//         if (
//             chat.groupChat &&
//             chat.creator.toString() !== req.user._id.toString()
//         ) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You are not allowed to delete this group",
//             });
//         }

//         // Save members before deleting the chat
//         const chatMembers = chat.members.map(
//             (member) => member.toString()
//         );

//         // Delete all messages belonging to this chat
//         await Message.deleteMany({
//             chat: chatId,
//         });

//         // Delete the chat
//         await Chat.findByIdAndDelete(chatId);

//         // Notify users to refresh their chat list
//         // emitEvent(req, REFETCH_CHATS, chatMembers);

//         return res.status(200).json({
//             success: true,
//             message: "Chat deleted successfully",
//         });

//     } catch (error) {
//         console.error("deleteChat:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

export const getMessages = async (req, res) => { // g

    try {

        const chatId = req.params.id;
        // console.log("chatId = ", chatId);
        const page = Number(req.query.page) || 1;

        const resultPerPage = 20;
        const skip = (page - 1) * resultPerPage;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (!chat.members.includes(req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this chat"
            });
        }

        const [messages, totalMessagesCount] = await Promise.all([
            Message.find({ chat: chatId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(resultPerPage)
                .populate("sender", "name",).populate("chat", "name groupChat")
                .lean(),

            Message.countDocuments({ chat: chatId }),
        ]);

        const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

        const hasMore = totalPages - page === 0 ? false : true

        return res.status(200).json({
            success: true,
            messages: messages.reverse(),
            totalPages,
            hasMore
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}
export const getChatId = async (req, res) => {
    try {
        const { userId } = req.params;
        // console.log("userId , user ", userId,req.user._id.toString());

        const chat = await Chat.findOne({
            groupChat: false,
            members: { $all: [req.user._id, userId] }
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        return res.status(200).json({
            success: true,
            chatId: chat._id,
            members: chat.members
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUnreadNotificationa = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            user: req.user._id,
        });

        // console.log("user", req.user._id);


        return res.status(200).json({
            success: true,
            unreadMessages: notification?.unreadMessages || {},
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });


    }
};

export const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.findOneAndUpdate(
            { user: req.user._id },
            {
                $unset: {
                    [`unreadMessages.${userId}`]: 1,
                },
            }
        );

        io.to(userSocketIDs.get(req.user._id.toString())).emit(
            "NOTIFICATION_READ",
            { userId }
        );

        return res.status(200).json({
            success: true,
            message: "Notifications cleared",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
        console.log(error);

    }
};
export const getFriendsToAdd = async (req, res) => {
    try {
        const { chatId, memberIds } = req.body;

        if (!chatId || !memberIds) {
            return res.status(400).json({
                success: false,
                message: "chatId and memberIds are required",
            });
        }

        const chats = await Chat.find({
            members: req.user._id,
            groupChat: false,
        }).populate("members", "name avatar bio");

        const friends = chats
            .map(({ members }) => {
                const friend = members.find(
                    member => member._id.toString() !== req.user._id.toString()
                );

                if (!friend) return null;

                return {
                    _id: friend._id,
                    name: friend.name,
                    avatar: friend.avatar,
                    bio: friend.bio,
                };
            })
            .filter(Boolean);

        const friendsToAdd = friends.filter(
            friend => !memberIds.includes(friend._id.toString())
        );

        return res.status(200).json({
            success: true,
            friends: friendsToAdd,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};