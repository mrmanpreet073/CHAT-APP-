import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { User } from "../Models/user.js";

dotenv.config();


export const seedUsers = async (count) => {
    try {
       

        const hashedPassword = await bcrypt.hash("123456", 10);

        for (let i = 0; i < count; i++) {
            const user = await User.create({
                name: faker.person.fullName(),
                userName: faker.internet.username(),
                password: hashedPassword,
                avatar: {
                    public_id: faker.system.fileName(),
                    url: faker.image.avatar(),
                },
            });

        }

        console.log(`${count} users created successfully`);

        await mongoose.connection.close();

    } catch (error) {
        console.error("Seeder error:", error);
       
    }
};

// 👇 Change this number
// seedUsers(10);