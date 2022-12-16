require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { S3 } = require('aws-sdk');
const uuid = require('uuid').v4;
const jwt = require('jsonwebtoken');
const validator = require('validator');
const userModel = require('../models/users_model');

// secret code for JWT
require('dotenv').config();
const { JWT_SECRET, AWS_BUCKET_NAME, IMAGES_URL } = process.env;

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

const upload = multer({
  // multer setting
  // 直接存server路徑
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
});

const s3upload = multer({
  // multer setting
  // 存S3先過此middleware
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // allow 10 MB
  },
});

const s3UploadFiles = async (files) => {
  //  automatically detects AWS credentials set as variables in .env
  const s3 = new S3();
  const params = files.map((file) => {
    const fileExtension = file.originalname.split('.').slice(-1)[0];
    return {
      Bucket: AWS_BUCKET_NAME,
      Key: `images/${uuid()}.${fileExtension}`,
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
    const user = jwt.verify(accessToken, JWT_SECRET);
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

// Reference from  https://www.geodatasource.com/developers/javascript
const getDistance = (lat1, lng1, lat2, lng2, unit) => {
  /* Unit
      'M' is statute miles (default)
      'K' is kilometers
      'N' is nautical miles
   */
  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lng1 - lng2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') {
    dist *= 1.609344;
  }
  if (unit === 'N') {
    dist *= 0.8684;
  }
  return dist;
};

const getImagePath = (imagePath) => {
  if (!imagePath.includes('https')) {
    return `${IMAGES_URL}/${imagePath}`;
  }
  return imagePath;
};

const sanitizeRequest = async (req, res, next) => {
  // sanitizers 處理惡意輸入
  const input = req.body;

  if (input.title) {
    input.title = validator.escape(input.title);
  }

  if (input.description) {
    input.description = validator.escape(input.description);
  }

  if (typeof input.tags == 'string') {
    input.tags = [input.tags];
  }
  if (input.tags) {
    input.tags = input.tags.filter((tag) => tag); // 去除array null
    input.tags.forEach((tag) => {
      tag = validator.escape(tag);
    });
  }

  next();
};

module.exports = {
  wrapAsync,
  authentication,
  reserveAuthorization,
  s3UploadFiles,
  upload,
  s3upload,
  getDistance,
  getImagePath,
  sanitizeRequest,
};
