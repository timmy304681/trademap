const router = require('express').Router();
const axios = require('axios');
const { getLineCode, getLineToken } = require('../controllers/reserve_controller');
const { wrapAsync } = require('../util/util');

router.route('/').get(wrapAsync(getLineCode));

// Callback URL from Line Notify
router.route('/callback').get(wrapAsync(getLineToken));

module.exports = router;
