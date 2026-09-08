import jwt from "jsonwebtoken"
import { User } from "../Models/user.js";

export const authenticateSocket = async (socket, token) => {
    if (!token) {
        throw new Error("Token missing");
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    // console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new Error("User not found");
    }

    socket.user = user;
};

