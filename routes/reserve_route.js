const router = require('express').Router();
const { wrapAsync, authentication, reserveAuthorization } = require('../util/util');

const { createReserve, getReserve, deleteReserve } = require('../controllers/reserve_controller');

router.route('/reserve').get(authentication, reserveAuthorization, wrapAsync(getReserve));
router.route('/reserve').post(authentication, reserveAuthorization, wrapAsync(createReserve));
router.route('/reserve').delete(authentication, reserveAuthorization, wrapAsync(deleteReserve));

module.exports = router;
