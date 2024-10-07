"use strict";

const User = require("../models/user");

module.exports = {
  list: async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } });

    // console.log(users);
    res.status(200).send({
      error: false,
      data: users,
    });
  },
};
