import { body, validationResult, check, param } from "express-validator";


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  const errorMessages = errors.array().map((error) => error.msg);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errorMessages,
    });
  }

  next();
};
export const newGroupValidator = [
  body("name", "Please Enter Name").notEmpty(),

  body("members")
    .notEmpty()
    .withMessage("Please Enter Members")
    .custom((members) => {
      if (!Array.isArray(members)) {
        throw new Error("Members must be an array");
      }

      if (members.length < 2 || members.length > 100) {
        throw new Error("Members must be 2-100");
      }

      return true;
    }),
];
export const addMemberValidator = [
  body("chatId", "Please Enter Chat ID").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please Enter Members")
    .isArray({ min: 1, max: 97 })
    .withMessage("Members must be 1-97"),
];

export const removeMemberValidator = [
  body("chatId", "Please Enter Chat ID").notEmpty(),
  body("userId", "Please Enter User ID").notEmpty(),
];

export const sendAttachmentsValidator = [
  body("chatId", "Please Enter Chat ID").notEmpty(),
];
export const chatIdValidator = [
  param("id", "Please Enter Chat ID").notEmpty()
];

export const renameValidator = [
  param("id", "Please Enter Chat ID").notEmpty(),
  body("name", "Please Enter New Name").notEmpty(),
];

export const sendRequestValidator = [
  body("userId", "Please Enter User ID").notEmpty(),
];
