import { Router } from 'express';
import * as controller from '../Controller/admin.js';

const router = Router();

router.get('/users', controller.allUsers);
router.get('/chats', controller.allChats);
router.get('/messages', controller.allMessages);

export default router;