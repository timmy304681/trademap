const router = require('express').Router();
const { wrapAsync } = require('../util/util');

const { getUser } = require('../controllers/users_controller');

router.route('/users').get(wrapAsync(getUser));

module.exports = router;
