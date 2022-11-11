const userModel = require('../models/users_model');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

// secret code for JWT
require('dotenv').config();
const { JWT_SECRET, JWT_EXPIRE_TIME } = process.env;

const getUser = async (req, res) => {
  const id = req.user.id;

  if (id === undefined) {
    return res.status(400).json({ error: 'NO user id ' });
  }
  const [user] = await userModel.getUser(id);
  if (user === undefined) {
    return res.status(400).json({ error: 'NO user id ' });
  }
  res.status(200).json(user);
};

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password } = req.body;
  const photo = req.file.path;

  if (!name || !email || !password) {
    res.status(400).send({ error: 'Request Error: name, email and password are required.' });
    return;
  }
  // validate email
  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' });
    return;
  }
  name = validator.escape(name);

  // validate strong password
  if (
    !validator.isStrongPassword(password, {
      minLength: 5,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    return res.status(400).json({ message: 'Password not strong enough' });
  }
  // hash password(default hashLength is 32, and the char number is 96)
  const passwordHash = await argon2.hash(password);

  // check if email already in db
  const search = await userModel.getEmail(email);
  if (search.length > 0) {
    return res.status(400).json({ message: 'Email Already Exists' });
  }

  // create user profile
  const result = await userModel.signUp(name, email, passwordHash, photo);

  if (result.err) {
    res.status(500).json(result);
    return;
  }

  // get jwt access token

  const payload = {
    id: result.id,
    name: result.name,
    email: result.email,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE_TIME });

  //
  const signUpResult = payload;
  signUpResult.token = token;

  res.status(200).json(signUpResult);
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  // search from db
  const user = await userModel.getEmail(email);

  // if no email exist
  if (user.length === 0) {
    return res.status(400).json({ message: 'Email or password is incorrect ' });
  }
  // if password is wrong
  const passwordVerify = await argon2.verify(user[0].password, password);
  console.log(passwordVerify);
  if (!passwordVerify) {
    return res.status(400).json({ message: 'Email or password is incorrect ' });
  }

  // get jwt access token

  const payload = {
    id: user[0].id,
    name: user[0].name,
    email: user[0].email,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE_TIME });

  const signInResult = payload;
  signInResult.token = token;
  res.status(200).json(signInResult);
};

module.exports = { getUser, signUp, signIn };
