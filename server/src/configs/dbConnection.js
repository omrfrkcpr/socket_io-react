const mongoose = require("mongoose");

const dbConnection = function () {
  // Connect:
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("* DB Connected * "))
    .catch((err) => {
      console.error("* DB Not Connected * ", err);
      process.exit(1); // Uygulamayı durdurun
    });
};

/* ------------------------------------------------------- */
module.exports = {
  mongoose,
  dbConnection,
};
