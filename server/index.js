const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const httpServer = require("http").createServer(app);  // Create an HTTP server instance
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect('mongodb+srv://jayaprasadb718:xZGx4lUaHFeYE4fR@cluster0.shd9di5.mongodb.net/jayaprasadb718?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log('Error in connecting to the database', err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

httpServer.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

io.on("connection", (socket) => {
  socket.on("join-chat", (userId) => {
    // You can use userId or chatId as a room identifier
    socket.join(userId);
    console.log(`User ${socket.id} joined chat ${userId}`);
  });

  socket.on("send-msg", (data, callback) => {
    try {
      const { to, msg } = data;
      io.to(to).emit("msg-recieve", msg);
      console.log(`Message sent to ${to}: ${msg}`);
      callback({ status: "success", message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error.message);
      callback({ status: "error", message: error.message });
    }
  });
});
