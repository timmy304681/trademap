const router = require('express').Router();
const { wrapAsync, authentication } = require('../util/util');

const { getOrders, changeOrderStatus } = require('../controllers/orders_controller');

router.route('/orders').get(authentication, wrapAsync(getOrders));
router.route('/orders').put(authentication, wrapAsync(changeOrderStatus));

module.exports = router;
