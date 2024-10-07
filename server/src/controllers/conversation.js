"use strict";

const { CustomError } = require("../errors/customError");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

module.exports = {
  list: async (req, res) => {
    if (!req.user) {
      throw new CustomError("Unauthorized", 401);
    }

    const conversations = await Conversation.find({
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    }).populate({ path: "messages", populate: "senderId" });

    res.send({ error: false, data: conversations });
  },
  create: async (req, res) => {
    const { name, participantIds } = req.body;

    if (!name || !participantIds || !participantIds.length) {
      throw new CustomError("Name and participant IDs are required.", 400);
    }

    const newConversation = new Conversation({
      name,
      createdBy: req.user._id,
      participantIds,
    });

    const savedConversation = await newConversation.save();

    res.status(201).send({ error: false, data: savedConversation });
  },
  read: async (req, res) => {
    const conversation = await Conversation.findOne({
      name: req.params.name,
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    }).populate({ path: "messages", populate: "senderId" });

    if (!conversation) throw new CustomError("Conversation not found", 404);

    res.send({ error: false, data: conversation });
  },
  update: async (req, res) => {
    const { name } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      {
        name: req.params.name,
        $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
      },
      { name }
    ).populate({ path: "messages", populate: "senderId" });

    if (!conversation) throw new CustomError("Conversation not found", 404);

    res.send({ error: false, data: conversation });
  },
  delete: async (req, res) => {
    const conversation = await Conversation.findOne({
      name: req.params.name,
    });
    if (!conversation) {
      throw new CustomError("Conversation not found", 404);
    }

    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.deleteOne({ name: req.params.name });

    res.status(204).send();
  },
};
