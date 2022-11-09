const router = require('express').Router();
const { wrapAsync } = require('../util/util');

const { createReserve } = require('../controllers/reserve_controller');

router.route('/reserve').post(wrapAsync(createReserve));

module.exports = router;
