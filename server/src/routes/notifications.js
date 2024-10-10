const express = require("express");
const router = express.Router();
const notification = require("../controllers/notification");

router.route("/").get(notification.list).post(notification.create);

router.get("/read", notification.readAll);

router
  .route("/:id")
  .put(notification.update)
  .patch(notification.update)
  .delete(notification.delete);

module.exports = router;
