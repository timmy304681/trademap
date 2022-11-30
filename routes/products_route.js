const router = require('express').Router();
const { wrapAsync, upload, s3upload, authentication, sanitizeRequest } = require('../util/util');

const {
  getProducts,
  postProduct,
  segmentTitles,
  reviseProduct,
} = require('../controllers/products_controller');

router.route('/products/tags').get(wrapAsync(segmentTitles));
router.route('/products/:category').get(wrapAsync(getProducts));
router.route('/products/details').patch(authentication, sanitizeRequest, wrapAsync(reviseProduct));
router
  .route('/products/')
  .post(authentication, s3upload.array('images', 10), sanitizeRequest, wrapAsync(postProduct));

module.exports = router;
