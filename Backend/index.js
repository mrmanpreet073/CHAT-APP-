import express from 'express';
import dotenv from 'dotenv/config';
import router from './Routes/user.js';
import connectDb from './Utils/db.js';
import cors from 'cors';
import { seedUsers } from './seed/userSeeder.js';
import chatRouter from "./Routes/chat.js"
import adminRouter from "./Routes/admin.js"
import { createMessagesInAChat, createSingleChats } from './seed/chatSeeder.js';

 
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173' || process.env.FRONTEND_URL,
}));

// Routes
app.use('/user', router);
app.use('/chat',chatRouter)
app.use('/admin',adminRouter)


async function main() {
    try {
        await connectDb();
        // await seedUsers(10);
        // await createSingleChats(10)
        // await createMessagesInAChat("6a91cc45dd1294ba8d7ec8e1",10)

        app.listen(PORT, () => {
            console.log(`Server is listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();