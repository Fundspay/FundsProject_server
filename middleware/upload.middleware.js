"use strict";
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const CONFIG = require("../config/config");

const s3 = new S3Client({
  region: CONFIG.s3Region,
  credentials: {
    accessKeyId: CONFIG.s3AccessKeyId,
    secretAccessKey: CONFIG.s3SecretAccessKey,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: CONFIG.s3Bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueName = `diagrams/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowed = /png|jpg|jpeg|pdf|drawio|vsdx|xml|svg|gif|bmp/;
    const ext = allowed.test(file.originalname.toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

module.exports = upload;