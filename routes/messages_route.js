const router = require('express').Router();
const { wrapAsync } = require('../util/util');

const { getMessages } = require('../controllers/messages_controller');

router.route('/messages').get(wrapAsync(getMessages));

module.exports = router;
