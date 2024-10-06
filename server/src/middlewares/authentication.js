"use strict";

/* ---------------------------------- */
/*           VOLUNTEERIUM API         */
/*           Auth Middleware          */
/* ---------------------------------- */
// app.use(authentication)

const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const auth = req.headers?.authorization || null; // Token ...tokenKey...
  const tokenKey = auth ? auth.split(" ") : null; // ['Token', '...tokenKey...']

  if (tokenKey) {
    if (tokenKey[0] == "Bearer") {
      // JWT:

      jwt.verify(tokenKey[1], process.env.ACCESS_KEY, (error, data) => {
        req.user = data;
      });
    }
  }

  next();
};
