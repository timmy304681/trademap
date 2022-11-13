const router = require('express').Router();
const { wrapAsync, authentication, reserveAuthorization } = require('../util/util');

const { createReserve, getReserve } = require('../controllers/reserve_controller');

router.route('/reserve').get(authentication, reserveAuthorization, wrapAsync(getReserve));
router.route('/reserve').post(authentication, reserveAuthorization, wrapAsync(createReserve));

module.exports = router;
