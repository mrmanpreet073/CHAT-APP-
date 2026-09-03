
import jwt from 'jsonwebtoken'
import { User } from '../Models/user.js';



export const authenticate = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization Token is Missing or Invalid"
            })
        }

        const token = authHeader.split(" ")[1]
        // console.log(token);


        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
            // console.log(decoded);

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token Expired"
                })
            }
            // console.log(error.response);

            return res.status(401).json({
                success: false,
                message: "Token Verification Failed"
            })
        }
        // console.log("decoded user",decoded);


        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found"
            })
        }
        req.user = user;
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

};

export const adminOnly = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first",
        });
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only.",
        });
    }

    next();
};
// export const isAdmin = async (req, res, next) => {

//     if(req.user && req.user.role==="admin"){
//         next()
//     }else{
//         return res.status(403).json({
//             success: false,
//             message: "Access denied admin only "
//         });
//     }

// };