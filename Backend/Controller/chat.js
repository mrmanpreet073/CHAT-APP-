import { Chat } from "../Models/chat.js";
import { Message } from "../Models/message.js";
import { User } from "../Models/user.js";
import { uploadFilesToCloudinary } from "../Utils/cloudinary.js";

export const newGroupChat = async (req, res) => {

    try {
        const { name, members } = req.body;

        if (members.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Must have at least 3 members"
            });
        }

        const allMembers = [...members, req.user._id]

        const groupChat = await Chat.create({
            name,
            groupChat: true,
            members: allMembers,
            creator: req.user._id
        })

        return res.status(201).json({
            success: true,
            message: "Group Chat Created",
            groupChat
        })

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
            creator: req.user._id,
        }).populate("members", "name avatar");

        const groups = chats.map(({ members, _id, groupChat, name }) => ({
            _id,
            groupChat,
            name,
            avatar: members.slice(0, 3).map(({ avatar }) => avatar?.url),
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


        // --------------------------------------------------
        // 9. Real-time events
        // --------------------------------------------------

        // Notify existing group members
        // emitEvent(
        //     req,
        //     ALERT,
        //     chat.members,
        //     `${allUsersName} has been added to the group`
        // );

        // Refresh chat list
        // emitEvent(
        //     req,
        //     REFETCH_CHATS,
        //     chat.members
        // );


        // --------------------------------------------------
        // 10. Send response
        // --------------------------------------------------

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

        return res.status(200).json({
            success: true,
            message: `${userThatWillBeRemoved.name} has been removed from the group`,
        });

        // Notify remaining/all members
        // emitEvent(req, ALERT, chat.members, {
        //     message: `${userThatWillBeRemoved.name} has been removed from the group`,
        //     chatId,
        // });

        // emitEvent(req, REFETCH_CHATS, allChatMembers);

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

        if (remainingMembers.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Group must have at least 3 members"
            });
        }

        if (chat.creator.toString() === req.user._id.toString()) {

            chat.creator = remainingMembers[0];
        }

        chat.members = remainingMembers;

        const user = await User.findById(req.user._id, "name");

        await chat.save();

        // emitEvent(req, ALERT, chat.members, {
        //     chatId,
        //     message: `User ${user.name} has left the group`,
        // });

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
            sender: me._id,
            chat: chatId,
        };

        const messageForRealTime = {
            ...messageForDB,
            sender: {
                _id: me._id,
                name: me.name,
            },
        };

        const message = await Message.create(messageForDB);

        //   emitEvent(req, NEW_MESSAGE, chat.members, {
        //     message: messageForRealTime,
        //     chatId,
        //   });

        //   emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

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
        if (req.query.populate === "true") {
            const chat = await Chat.findById(req.params.id)
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
        const { page = 1 } = req.query;

        const resultPerPage = 5;
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

        return res.status(200).json({
            success: true,
            messages: messages.reverse(),
            totalPages,
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}