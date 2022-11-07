const router = require('express').Router();
const { wrapAsync } = require('../util/util');

const { getOrders } = require('../controllers/orders_controller');

router.route('/orders').get(wrapAsync(getOrders));

module.exports = router;
