const router = require('express').Router();
const { wrapAsync, upload } = require('../util/util');

const { getProducts, postProduct } = require('../controllers/products_controller');

router.route('/products/:category').get(wrapAsync(getProducts));

router.route('/products/').post(
  upload.fields([
    {
      name: 'image',
      maxCount: 10,
    },
  ]),
  wrapAsync(postProduct)
);
module.exports = router;
