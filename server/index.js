"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");

const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"],
  credentials: true, // This allows the client to send the token with the request
  allowedHeaders: ["Content-Type", "Authorization"], // This is needed to send the token in the request headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(require("./src/middlewares/authentication"));
app.use(require("./src/routes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

// Import and use the socket handler
const socketHandler = require("./src/middlewares/socketHandler");
socketHandler(io);

const { setIoInstance } = require("./src/configs/socketInstance");
setIoInstance(io);

// Error Handler Middleware
app.use(require("./src/middlewares/errorHandler"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
