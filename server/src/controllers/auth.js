"use strict";

const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { CustomError } = require("../errors/customError");
const { generateAccessToken } = require("../helpers/tokenGenerator");

module.exports = {
  register: async (req, res) => {
    const { username, email, password } = req.body;

    if ((username, email, password)) {
      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        throw new CustomError("User already exists!", 400);
      }

      const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

      // Create new user
      const hashedPassword = bcrypt.hashSync(password, 10);
      user = new User({
        username,
        email,
        avatar: avatarUrl,
        password: hashedPassword,
      });

      // Save new user to the database
      const newUser = await user.save();

      // Generate JWT token for the new user
      const accessToken = generateAccessToken(newUser);

      res.status(200).send({
        error: false,
        message: "You are successfully registered!",
        bearer: {
          access: accessToken,
        },
        user: newUser,
      });
    } else {
      throw new CustomError("Missing required fields!", 400);
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if ((email, password)) {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        throw new CustomError("Invalid email or password!", 401);
      }

      // Check if password matches hashed password
      const isPasswordMatch = bcrypt.compareSync(password, user.password);
      if (!isPasswordMatch) {
        throw new CustomError("Invalid email or password!", 401);
      }

      // Generate JWT token for the user
      const accessToken = generateAccessToken(user);

      res.status(200).send({
        error: false,
        message: "You are successfully logged in!",
        bearer: {
          access: accessToken,
        },
        user: user,
      });
    } else {
      throw new CustomError("Missing required fields!", 400);
    }
  },
  logout: async (req, res) => {
    const auth = req.headers?.authorization;
    const tokenKey = auth ? auth.split(" ") : null;
    let deleted = null;

    if (tokenKey) {
      if (tokenKey[0] == "Bearer") {
        // JWT Token Logout - No action needed, just confirm logout
        deleted = true;
      }
    } else {
      throw new CustomError("No Authorization Header provided!", 401);
    }

    res.status(deleted !== null ? 200 : 400).send({
      error: !deleted !== null,
      message:
        deleted !== null
          ? "You are successfully logged out!"
          : "Logout failed. Please try again!",
    });
  },
};
