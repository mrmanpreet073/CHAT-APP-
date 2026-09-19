import express from 'express';
import dotenv from 'dotenv/config';
import router from './Routes/user.js';
import connectDb from './Utils/db.js';
import cors from 'cors';
import { seedUsers } from './seed/userSeeder.js';
import chatRouter from "./Routes/chat.js"
import adminRouter from "./Routes/admin.js"
import { createMessagesInAChat, createSingleChats } from './seed/chatSeeder.js';

import { v4 as uuid } from "uuid"
import { Server } from "socket.io";
import { createServer } from "http";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from './Utils/events.js';
import { Message } from './Models/message.js';
import { getSockets } from './Utils/helper.js';
import { authenticateSocket } from './Middleware/authenticateSocket.js';
import { Notification } from './Models/Notification.js';
import { Chat } from './Models/chat.js';


const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: ["https://chat-app-lyart-five-73.vercel.app"],
        credentials: true,
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "https://chat-app-lyart-five-73.vercel.app",
    credentials: true,
}));

// Routes
app.use('/user', router);
app.use('/chat', chatRouter)
app.use('/admin', adminRouter)

export const userSocketIDs = new Map();
const onlineUsers = new Set();

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        // console.log("BACKEND TOKEN:", token);
        await authenticateSocket(socket, token);
        // console.log("Authentication successful");
        next();
    } catch (error) {
        console.log("Authentication failed:", error.message);
        next(new Error(error.message));
    }
});


io.on("connection", (socket) => {

    const user = socket.user;

    userSocketIDs.set(user._id.toString(), socket.id);
    // console.log("USER CONNECTED:", user._id.toString(), "SOCKET:", socket.id);

    socket.on("disconnect", () => {
        // console.log("USER DISCONNECTED:", user._id.toString(), "SOCKET:", socket.id);
        if (userSocketIDs.get(user._id.toString()) === socket.id) {
            userSocketIDs.delete(user._id.toString());
        }
    });

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        try {
            // 1. Save message
            const messageForDB = {
                content: message,
                sender: user._id,
                chat: chatId,
            };

            const newMessage = await Message.create(messageForDB);

            // 2. Prepare real-time message
            const messageForRealTime = {
                _id: newMessage._id,
                content: newMessage.content,
                sender: {
                    _id: user._id,
                    name: user.name,
                },
                chat: chatId,
                createdAt: newMessage.createdAt,
            };

            // 3. Get chat
            const chat = await Chat.findById(chatId);


            // 4. ADD THE GROUP/1-TO-1 NOTIFICATION CODE HERE

            const membersSocket = getSockets(members);


            if (chat.groupChat) {
                // Group notification
                for (const memberId of chat.members) {
                    if (memberId.toString() === socket.user._id.toString()) {
                        continue;
                    }

                    await Notification.findOneAndUpdate(
                        { user: memberId },
                        {
                            $inc: {
                                [`unreadMessages.${chatId}`]: 1,
                            },
                        },
                        {
                            upsert: true,
                            returnDocument: "after",
                        }
                    );
                }

                // Group realtime notification
                io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
                    chatId,
                    senderId: socket.user._id.toString(),
                });

            } else {
                // Your existing 1-to-1 notification
                const receiverId = chat.members.find(
                    memberId =>
                        memberId.toString() !== socket.user._id.toString()
                );

                await Notification.findOneAndUpdate(
                    { user: receiverId },
                    {
                        $inc: {
                            [`unreadMessages.${user._id}`]: 1,
                        },
                    },
                    {
                        upsert: true,
                        returnDocument: "after",
                    }
                );

                // Your existing 1-to-1 realtime notification
                io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
                    userId: user._id,
                    senderId: socket.user._id.toString(),
                    chatId
                });
            }

            // 5. Send message to members

            io.to(membersSocket).emit(NEW_MESSAGE, {
                chatId,
                message: messageForRealTime,

            });

            // 6. Your existing alert
            // io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
            //     userId: user._id,
            // });

        } catch (error) {
            console.error("Message error:", error);
        }
    });
});

async function main() {
    try {
        await connectDb();

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();