const router = require('express').Router();
const { wrapAsync, authentication } = require('../util/util');

const { getMessages, getChatrooms, createChatroom } = require('../controllers/messages_controller');

router.route('/messages').get(authentication, wrapAsync(getMessages));
router
  .route('/chatrooms')
  .get(authentication, wrapAsync(getChatrooms))
  .post(authentication, wrapAsync(createChatroom));

module.exports = router;
