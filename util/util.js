require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { S3 } = require('aws-sdk');
const uuid = require('uuid').v4;

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

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get('Authorization');
    if (!accessToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    accessToken = accessToken.replace('Bearer ', '');
    if (accessToken == 'null') {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    try {
      const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
      req.user = user;
      if (roleId == null) {
        next();
      } else {
        let userDetail;
        if (roleId == User.USER_ROLE.ALL) {
          userDetail = await User.getUserDetail(user.email);
        } else {
          userDetail = await User.getUserDetail(user.email, roleId);
        }
        if (!userDetail) {
          res.status(403).send({ error: 'Forbidden' });
        } else {
          req.user.id = userDetail.id;
          req.user.role_id = userDetail.role_id;
          next();
        }
      }
      return;
    } catch (err) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }
  };
};

module.exports = {
  wrapAsync,
  authentication,
  s3UploadFiles,
  upload,
};
