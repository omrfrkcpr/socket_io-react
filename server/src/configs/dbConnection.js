const mongoose = require("mongoose");

const dbConnection = function () {
  // Connect:
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("* DB Connected * "))
    .catch((err) => {
      console.error("* DB Not Connected * ", err);
      process.exit(1);
    });
};

/* ------------------------------------------------------- */
module.exports = {
  mongoose,
  dbConnection,
};
