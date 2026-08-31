import { Router } from 'express';
import * as controller from '../Controller/chat.js';
import { authenticate } from '../Middleware/auth.js';
import { attachmentUpload } from '../Middleware/multer.js';
import { addMemberValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validate } from '../Validator/chat.js';

const router = Router();

router.post('/new', newGroupValidator, validate, authenticate, controller.newGroupChat);
router.get('/myChats', authenticate, controller.getMyChats);
router.get('/myGroups', authenticate, controller.getMyGroups);
router.post('/addMembers', addMemberValidator, validate, authenticate, controller.addMembers);
router.post('/removeMember', removeMemberValidator, validate, authenticate, controller.removeMember);
router.post('/leaveGroup/:id', authenticate, controller.leaveGroup);
router.post('/message', sendAttachmentsValidator, validate, authenticate, attachmentUpload, controller.sendAttachments);

router.route("/:id")
  .get(chatIdValidator,validate, authenticate, controller.getChatDetails)
  .put(renameValidator,validate,authenticate, controller.renameGroup)
//   .delete(chatIdValidator(), deleteChat);

router.post('/getChatMessages/:id', authenticate, controller.getMessages);


export default router;