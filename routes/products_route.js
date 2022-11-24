const router = require('express').Router();
const { wrapAsync, upload, authentication } = require('../util/util');

const { getProducts, postProduct, segmentTitles } = require('../controllers/products_controller');

router.route('/products/tags').get(wrapAsync(segmentTitles));

router.route('/products/:category').get(wrapAsync(getProducts));

router.route('/products/').post(authentication, upload.array('images', 10), wrapAsync(postProduct));

module.exports = router;
