import mongoose, { Types } from "mongoose";

const schema = new mongoose.Schema({

    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    chat: {
        type: Types.ObjectId,
        ref: "Chat",
        required: true
    },
    content: {
        type: String
    },
    attachments: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            }
        }
    ]
},
    {
        timestamps: true
    });

export const Message = mongoose.model("Message", schema);

