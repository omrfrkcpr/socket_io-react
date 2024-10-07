const express = require("express");
const router = express.Router();
const conversation = require("../controllers/conversation");

router.route("/").get(conversation.list).post(conversation.create);

router
  .route("/name/:name")
  .get(conversation.read)
  .put(conversation.update)
  .patch(conversation.update)
  .delete(conversation.delete);

module.exports = router;
