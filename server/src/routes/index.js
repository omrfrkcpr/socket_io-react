"use strict";

const router = require("express").Router();
/* ------------------------------------------------------- */

// URL: /

// auth:
router.use("/auth", require("./auth"));
// conversations:
router.use("/conversations", require("./conversations"));

/* ------------------------------------------------------- */
module.exports = router;
