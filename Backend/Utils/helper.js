import { userSocketIDs } from "../index.js";


export const getOtherMember = (members, userId) =>
  members.find((member) => member._id.toString() !== userId.toString());

export const getSockets = (users = []) =>
  users
    .map((user) => userSocketIDs.get(user.toString()))
    .filter(Boolean);