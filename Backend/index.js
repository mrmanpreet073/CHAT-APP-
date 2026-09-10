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
import { log } from 'console';


const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173' || process.env.FRONTEND_URL,
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
        console.log("USER DISCONNECTED:", user._id.toString(), "SOCKET:", socket.id);
        if (userSocketIDs.get(user._id.toString()) === socket.id) {
            userSocketIDs.delete(user._id.toString());
        }
    });

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        try {
            const messageForDB = {
                content: message,
                sender: user._id,
                chat: chatId,
            };

            const newMessage = await Message.create(messageForDB);

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

            const membersSocket = getSockets(members);

            // console.log("EMITTING NEW_MESSAGE TO:", membersSocket);
            io.to(membersSocket).emit(NEW_MESSAGE, {
                chatId,
                message: messageForRealTime,
            });

            // io.to(socket.id).emit("TEST_MESSAGE", {
            //     message: "Hello from server",
            // });
            io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
                chatId,
            });

        } catch (error) {
            console.error("Message error:", error);
        }
    });

});

async function main() {
    try {
        await connectDb();

        server.listen(PORT, () => {
            console.log(`Server is listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();