const router = require('express').Router();
const { wrapAsync, authentication } = require('../util/util');

const { getUser, signUp, signIn } = require('../controllers/users_controller');

router.route('/users').get(authentication, wrapAsync(getUser));
router.route('/users/signup').post(wrapAsync(signUp));
router.route('/users/signin').post(wrapAsync(signIn));

module.exports = router;
