const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();


app.use(express.json());





app.use(cors(
    {
        origin: ["https://chat-app3-frontend.vercel.app"],
        methods: ["POST", "GET"],
        credentials: true
    }
));




mongoose
  .connect('mongodb+srv://jayaprasadb718:xZGx4lUaHFeYE4fR@cluster0.shd9di5.mongodb.net/jayaprasadb718?retryWrites=true&w=majority',{writeConcern:{w:'majority'}}, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log('error in connecting database',err.message);
  });

app.get("/", (req, res) => {
    res.json("Hello");
})

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "https://chat-app3-frontend.vercel.app",
    credentials: true,
  },
});


global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
