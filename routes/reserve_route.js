const router = require('express').Router();
const { wrapAsync, authentication } = require('../util/util');

const { createReserve } = require('../controllers/reserve_controller');

router.route('/reserve').post(authentication, wrapAsync(createReserve));

module.exports = router;
