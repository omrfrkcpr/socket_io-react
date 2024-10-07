"use strict";

const jwt = require("jsonwebtoken");
const { CustomError } = require("../errors/customError");

const socketAuth = (socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    console.error("No token provided.");
    return socket.disconnect();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY);
    socket.user = decoded;
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    return next(new CustomError("Authentication error", 403));
  }
};

module.exports = socketAuth;
