const router = require('express').Router();
const { wrapAsync } = require('../util/util');

const { getMessages, getChatrooms } = require('../controllers/messages_controller');

router.route('/messages').get(wrapAsync(getMessages));
router.route('/chatrooms').get(wrapAsync(getChatrooms));

module.exports = router;
