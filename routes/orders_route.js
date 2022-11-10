const router = require('express').Router();
const { wrapAsync, authentication } = require('../util/util');

const { getOrders } = require('../controllers/orders_controller');

router.route('/orders').get(authentication, wrapAsync(getOrders));

module.exports = router;
