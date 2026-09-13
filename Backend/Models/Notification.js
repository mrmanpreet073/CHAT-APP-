import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  unreadMessages: {
    type: Map,
    of: Number,
    default: {},
  },
});

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);