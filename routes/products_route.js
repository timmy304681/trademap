const router = require('express').Router();
const { wrapAsync, upload, s3upload, authentication } = require('../util/util');

const {
  getProducts,
  postProduct,
  segmentTitles,
  reviseProduct,
} = require('../controllers/products_controller');

router.route('/products/tags').get(wrapAsync(segmentTitles));

router.route('/products/:category').get(wrapAsync(getProducts));
router.route('/products/details').patch(wrapAsync(reviseProduct));

router
  .route('/products/')
  .post(authentication, s3upload.array('images', 10), wrapAsync(postProduct));

module.exports = router;
