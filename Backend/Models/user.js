import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      // match: [
      //   /^[a-zA-Z0-9_]+$/,
      //   "Username can only contain letters, numbers and underscores",
      // ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
    },

    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: ""
    }

  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", schema);