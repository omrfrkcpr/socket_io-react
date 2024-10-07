"use strict";

const router = require("express").Router();
/* ------------------------------------------------------- */

// URL: /

// auth:
router.use("/auth", require("./auth"));
// conversations:
router.use("/conversations", require("./conversations"));
// users:
router.use("/users", require("./users"));

/* ------------------------------------------------------- */
module.exports = router;
