const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const Message = require("../models/message");

// Get all conversations
router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.find().populate("messages");
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new conversation
router.post("/", async (req, res) => {
  const conversation = new Conversation({
    name: req.body.name,
  });

  try {
    const newConversation = await conversation.save();
    res.status(201).json(newConversation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a conversation by name
router.get("/name/:name", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      name: req.params.name,
    }).populate("messages");
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a conversation by name
router.put("/name/:name", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ name: req.params.name });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.name = req.body.name;
    await conversation.save();

    res.json(conversation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a conversation by name
router.delete("/name/:name", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ name: req.params.name });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.deleteOne({ name: req.params.name });

    res.json({ message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
