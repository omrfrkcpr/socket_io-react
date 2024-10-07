const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const { CustomError } = require("../errors/customError");

// Get all conversations for the user
router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const conversations = await Conversation.find({
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    }).populate({path:"messages", populate: "senderId"});

    res.send({ error: false, data: conversations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new conversation
router.post("/", async (req, res) => {
  const { name, participantIds } = req.body;

  if (!name || !participantIds || !participantIds.length) {
    return res.status(400).send("Name and participant IDs are required.");
  }

  const newConversation = new Conversation({
    name,
    createdBy: req.user._id,
    participantIds,
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(201).send({ error: false, data: savedConversation });
  } catch (err) {
    throw new CustomError(err.message, 500);
  }
});

// Get a conversation by name
router.get("/name/:name", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      name: req.params.name,
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    }).populate({path:"messages", populate: "senderId"});
    if (!conversation) throw new CustomError("Conversation not found", 404);
    res.send({ error: false, data: conversation });
  } catch (err) {
    throw new CustomError(err.message, 500);
  }
});

// Update a conversation by name
router.put("/name/:name", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      name: req.params.name,
      createdBy: req.user._id,
    });
    if (!conversation) {
      throw new CustomError("Conversation not found", 404);
    }

    conversation.name = req.body.name;
    await conversation.save();

    res.send({ error: false, data: conversation });
  } catch (err) {
    throw new CustomError(err.message, 500);
  }
});

// Delete a conversation by name
router.delete("/name/:name", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      name: req.params.name,
      createdBy: req.user._id,
    });
    if (!conversation) {
      throw new CustomError("Conversation not found", 404);
    }

    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.deleteOne({ name: req.params.name });

    res.status(204).send();
  } catch (err) {
    throw new CustomError(err.message, 500);
  }
});

module.exports = router;
