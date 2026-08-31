
import { Chat } from "../Models/chat.js";
import { Message } from "../Models/message.js";
import { User } from "../Models/user.js";

// login
// logout

export const allUsers = async (req, res) => {

  try {
    const users = await User.find({});

    const transformedUsers = await Promise.all(
      users.map(async ({ name, username, avatar, _id }) => {
        const [groups, friends] = await Promise.all([
          Chat.countDocuments({ groupChat: true, members: _id }),
          Chat.countDocuments({ groupChat: false, members: _id }),
        ]);

        return {
          name,
          username,
          avatar: avatar.url,
          _id,
          groups,
          friends,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      users: transformedUsers,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

}

export const allChats = async (req, res) => { // Get all chats with members and creator populated, and total messages count for each chat
  try {
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");

    const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, name, creator }) => {
        const totalMessages = await Message.countDocuments({ chat: _id });

        return {
          _id,
          groupChat,
          name,
          avatar: members.slice(0, 3).map((member) => member.avatar.url),
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
          })),
          creator: {
            name: creator?.name || "None",
            avatar: creator?.avatar.url || "",
          },
          totalMembers: members.length,
          totalMessages,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      chats: transformedChats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


export const allMessages = async (req, res) => {
    try {
        // Get all messages and populate sender and chat information
        const messages = await Message.find({})
            .populate({
                path: "sender",
                select: "name avatar",
            })
            .populate({
                path: "chat",
                select: "groupChat",
            });

        // Transform messages into a frontend-friendly format
        const transformedMessages = messages.map(
            ({
                content,
                attachments,
                _id,
                sender,
                createdAt,
                chat,
            }) => ({
                _id,
                attachments,
                content,
                createdAt,

                // Chat information
                chat: chat?._id,
                groupChat: chat?.groupChat,

                // Sender information
                sender: sender
                    ? {
                          _id: sender._id,
                          name: sender.name,
                          avatar: sender.avatar?.url || "",
                      }
                    : null,
            })
        );

        return res.status(200).json({
            success: true,
            messages: transformedMessages,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};