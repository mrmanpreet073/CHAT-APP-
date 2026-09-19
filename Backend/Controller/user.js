import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../Models/user.js";
import { Chat } from "../Models/chat.js";
import { Request } from "../Models/request.js";
import { getOtherMember } from "../Utils/helper.js";
import e from "express";
import { uploadToCloudinary } from "../Utils/cloudinary.js";
import { io, userSocketIDs } from "../index.js";



export const health = async (req, res) => {

    try {
        console.log("Healt Good");

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

};



export const register = async (req, res) => {
    try {

        const { name, userName, password } = req.body;

        if (!name || !userName || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ userName });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        let avatar = {};

        if (req.file) {

            const result = await uploadToCloudinary(req.file.buffer);

            avatar = {
                public_id: result.public_id,
                url: result.url,
            };

        } else {
            return res.status(400).json({
                success: false,
                message: "Avatar is required"
            });
        }

        const user = await User.create({
            name,
            userName,
            password: hashedPassword,
            avatar,
        });
        const accessToken = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );


        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                userName: user.userName,
                avatar: user.avatar,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        // 1. Validate input
        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        // 2. Find user
        // Password is select:false in your schema,
        // so we explicitly include it here.
        const user = await User.findOne({ userName }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        // 3. Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        // 4. Generate access token
        const accessToken = jwt.sign({ id: user._id, }, process.env.JWT_SECRET,
            { expiresIn: "1d", });

        // 5. Send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                userName: user.userName,
                avatar: user.avatar,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const searchUser = async (req, res) => {
    try {
        const { name = "" } = req.query;

        // Finding All my chats
        const myChats = await Chat.find({ groupChat: false, members: req.user._id });

        //  extracting All Users from my chats means friends or people I have chatted with
        const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

        // Finding all users except me and my friends
        const allUsersExceptMeAndFriends = await User.find({
            _id: { $nin: allUsersFromMyChats },
            name: { $regex: name, $options: "i" },
        });

        // Modifying the response
        const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar?.url || "",
        }));

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

export const sendFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (req.user._id.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a friend request to yourself",
            });
        }

        const request = await Request.findOne({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id },
            ],
        });

        if (request) {
            return res.status(400).json({
                success: false,
                message: "Request already sent"
            });
        }

        const newRequest = await Request.create({
            sender: req.user._id,
            receiver: userId,
        });

        const receiverSocketId = userSocketIDs.get(userId.toString());

        // console.log("Receiver User ID:", userId.toString());
        // console.log("Receiver Socket ID:", receiverSocketId);
        // console.log("Socket Map:", userSocketIDs);

        if (receiverSocketId) {
            // console.log("Sending NOTIFICATION");
            io.to(receiverSocketId).emit("NOTIFICATION", {
                request: {
                    _id: newRequest._id,
                    sender: {
                        _id: req.user._id,
                        name: req.user.name,
                        avatar: req.user.avatar?.url,
                    }
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Friend Request Sent",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const acceptFriendRequest = async (req, res, next) => {

    try {

        const { requestId, accept } = req.body;

        const request = await Request.findById(requestId)
            .populate("sender", "name")
            .populate("receiver", "name");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (request.receiver._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this request"
            });
        }

        if (!accept) {
            await request.deleteOne();

            return res.status(200).json({
                success: true,
                message: "Friend Request Rejected",
            });
        }

        const members = [request.sender._id, request.receiver._id];

        // Check if a private chat already exists
        const existingChat = await Chat.findOne({
            groupChat: false,
            members: { $all: members },
        });

        if (existingChat) {
            // Request is no longer needed
            await request.deleteOne();

            return res.status(400).json({
                success: false,
                message: "Chat already exists",
            });
        }

        await Promise.all([
            Chat.create({
                members,
                name: `${request.sender.name}-${request.receiver.name}`,
                groupChat: false,
            }),

            User.findByIdAndUpdate(request.sender._id, {
                $addToSet: { friends: request.receiver._id },
            }),

            User.findByIdAndUpdate(request.receiver._id, {
                $addToSet: { friends: request.sender._id },
            }),

            request.deleteOne(),
        ]);

        const senderSocketId = userSocketIDs.get(
            request.sender._id.toString()
        );

        const receiverSocketId = userSocketIDs.get(
            request.receiver._id.toString()
        );

        if (senderSocketId) {
            io.to(senderSocketId).emit("REFETCH_CHATS");
        }

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("REFETCH_CHATS");
        }

        return res.status(200).json({
            success: true,
            message: "Friend Request Accepted",
            senderId: request.sender._id,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

export const getMyNotifications = async (req, res) => {

    try {
        const requests = await Request.find({ receiver: req.user._id }).populate(
            "sender",
            "name avatar"
        );

        const allRequests = requests.map(({ _id, sender }) => ({
            _id,
            sender: {
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar.url,
            },
        }));



        return res.status(200).json({
            success: true,
            allRequests,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

}

// export const getMyFriends = async (req, res) => {
//     try {
//         const chatId = req.query.chatId;

//         // console.log("req.user._id", req.user._id);



//         // Find all private chats of the logged-in user
//         const chats = await Chat.find({
//             members: req.user._id,
//             groupChat: false,
//         }).populate("members", "name avatar bio");

//         // console.log(chats);


//         // Get the other user from each private chat
//         const friends = chats.map(({ members }) => {
//             // console.log("MEMBERS:", members);
//             // console.log("CURRENT USER:", req.user._id);

//             const otherUser = getOtherMember(
//                 members,
//                 req.user._id
//             );

//             // console.log("OTHER USER:", otherUser);
//             // console.log("BIO:", otherUser);
//             // console.log("TYPE:", typeof otherUser.bio);

//             return {
//                 _id: otherUser._id,
//                 name: otherUser.name,
//                 avatar: otherUser.avatar?.url || "",
//                 bio: otherUser.bio || ""
//             };
//         });



//         // If chatId is provided,
//         // return only friends who are not already in that group
//         if (chatId) {
//             const chat = await Chat.findById(chatId);

//             if (!chat) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Chat not found",
//                 });
//             }

//             const availableFriends = friends.filter(
//                 (friend) =>
//                     !chat.members.some(
//                         (member) =>
//                             member.toString() ===
//                             friend._id.toString()
//                     )
//             );

//             return res.status(200).json({
//                 success: true,
//                 friends: availableFriends,

//             });
//         }

//         // No chatId → return all friends
//         return res.status(200).json({
//             success: true,
//             friends,

//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


export const getMyFriends = async (req, res) => {
    try {
        const chatId = req.query.chatId;

        // Find all private chats of the logged-in user
        const chats = await Chat.find({
            members: req.user._id,
            groupChat: false,
        }).populate("members", "name avatar bio");

        // Get the other user from each private chat
        const friends = chats
            .map((chat) => {
                const otherUser = getOtherMember(
                    chat.members,
                    req.user._id
                );

                if (!otherUser) return null;

                return {
                    _id: otherUser._id,       // User ID
                    chatId: chat._id,         // Chat ID
                    name: otherUser.name,
                    avatar: otherUser.avatar?.url || "",
                    bio: otherUser.bio || "",
                };
            })
            .filter(Boolean);

        // If chatId is provided,
        // return only friends who are not already in that group
        if (chatId) {
            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found",
                });
            }

            const availableFriends = friends.filter(
                (friend) =>
                    !chat.members.some(
                        (member) =>
                            member.toString() ===
                            friend._id.toString()
                    )
            );

            return res.status(200).json({
                success: true,
                friends: availableFriends,
            });
        }

        // No chatId → return all friends
        return res.status(200).json({
            success: true,
            friends,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};