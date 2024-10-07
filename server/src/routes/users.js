"use strict";

const router = require("express").Router();
const { list } = require("../controllers/users");

// URL: /users

router.get("/", list);

module.exports = router;
