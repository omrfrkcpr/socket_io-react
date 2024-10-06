"use strict";

const jwt = require("jsonwebtoken");

// Generate Access Token
const generateAccessToken = (user) => {
  const accessInfo = {
    key: process.env.ACCESS_KEY,
    time: process.env.ACCESS_EXP || "1d",
    data: {
      _id: user._id,
      email: user.email,
    },
  };

  const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
    expiresIn: accessInfo.time,
  });

  console.log("AccessToken generated: ", accessToken);
  return accessToken;
};

module.exports = {
  generateAccessToken,
};
