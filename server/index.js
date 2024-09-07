const express = require("express");
const app = express();
const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());

const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

server.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
