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
import { NEW_MESSAGE } from './Utils/events.js';
import { Message } from './Models/message.js';
import { log } from 'console';
import { getSockets } from './Utils/helper.js';


const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173' || process.env.FRONTEND_URL,
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

const userSocketIDs = new Map();
const onlineUsers = new Set();

// seedUsers(19)

io.on("connection", (socket) => {
    // const user = socket.user;
    // console.log("socket user = ", socket.user);
    const user = {
        _id: "fsfsf",
        name: "dopeglaner"
    }

    userSocketIDs.set(user._id.toString(), socket.id);
    console.log("userSocketIDs", userSocketIDs);


    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString(),
        };

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
        };
        console.log("message for db=", messageForDB);

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });
        // io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

        // try {
        //     await Message.create(messageForDB);
        // } catch (error) {
        //     throw new Error(error);
        // }
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