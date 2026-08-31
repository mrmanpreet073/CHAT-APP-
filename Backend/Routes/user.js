import { Router } from 'express';
import * as controller from '../Controller/user.js';
import { singleAvatar } from '../Middleware/multer.js';
import { authenticate } from '../Middleware/auth.js';
import { loginValidator, registerValidator, validate, validateAvatar } from '../Validator/User.js';

const router = Router();

router.get('/', controller.health);
router.post('/register', singleAvatar,validateAvatar,registerValidator, validate,controller.register);
router.post('/login',loginValidator,validate, controller.login);

router.use(authenticate); // Apply the authenticate middleware to all routes below this line
router.get('/searchUser', controller.searchUser);
router.post('/sendRequest', controller.sendFriendRequest);
router.post('/requestResponse', controller.acceptFriendRequest);
router.post('/notification', controller.getMyNotifications);
router.post('/friends', controller.getMyFriends);// gives the list of friends of the user 


export default router;