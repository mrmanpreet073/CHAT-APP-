import mongoose, { Types } from "mongoose";

const schema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    groupChat: {
        type: Boolean,
        default: false
        // required: true,

    },
    creator: {
        type: Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            type: Types.ObjectId,
            ref: "User"
        }
    ],
    image: {
        public_id: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: null,
        },
    }
}, {
    timestamps: true
});

export const Chat = mongoose.model("Chat", schema);

