require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { S3 } = require('aws-sdk');
const uuid = require('uuid').v4;
const jwt = require('jsonwebtoken');
const userModel = require('../models/users_model');

// secret code for JWT
require('dotenv').config();
const { JWT_SECRET } = process.env;

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const upload = multer({
  // multer setting
  // 原本直接存server路徑
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'images');
    },
    filename: (req, file, callback) => {
      const fileExtension = file.originalname.split('.').slice(-1)[0];
      callback(null, `${uuid()}.${fileExtension}`);
      // callback(null, `${file.originalname}`);
    },
  }),
  //S3
  // return multer({
  //   storage:  multer.memoryStorage(),
  // });
});

const s3UploadFiles = async (files) => {
  //  automatically detects AWS credentials set as variables in .env
  const s3 = new S3();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${uuid()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: 'image/jpg',
    };
  });
  //   return await s3.upload(param).promise();
  return Promise.all(params.map((param) => s3.upload(param).promise()));
};

const authentication = async (req, res, next) => {
  let accessToken = req.get('authorization');
  if (!accessToken) {
    return res.status(401).send({ error: 'Wrong token' });
  }

  accessToken = accessToken.replace('Bearer ', '');
  if (accessToken === 'null') {
    return res.status(401).send({ error: 'Wrong token' });
  }

  try {
    const user = await jwt.verify(accessToken, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Wrong token' });
  }
};

const reserveAuthorization = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await userModel.getUser(id);
    const roleId = user[0]['role_id'];
    const rolePermission = await userModel.getRolePermission(roleId);
    const permissionArr = rolePermission.map((x) => x['permission_id']);

    // permission 4 means "reserve" function of trademap
    if (!permissionArr.includes(4)) {
      return res.status(403).send({ error: 'Unauthorized' });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  wrapAsync,
  authentication,
  reserveAuthorization,
  s3UploadFiles,
  upload,
};
