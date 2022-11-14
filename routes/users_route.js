const router = require('express').Router();
const { wrapAsync, authentication, upload } = require('../util/util');

const { getUser, signUp, signIn, saveLineToken } = require('../controllers/users_controller');

router.route('/users').get(authentication, wrapAsync(getUser));
router.route('/users/signup').post(upload.single('photo'), wrapAsync(signUp));
router.route('/users/signin').post(wrapAsync(signIn));
router.route('/users/lineToken').post(authentication, wrapAsync(saveLineToken));
module.exports = router;
