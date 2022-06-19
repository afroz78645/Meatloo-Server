import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import fast2sms from "fast-two-sms";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Emmiter from "events";
dotenv.config();

connectDB();

const app = express();
app.use(cors());

app.use(bodyParser.json());

const eventEmmiter = new Emmiter();
app.set("eventEmmiter", eventEmmiter);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

app.post("/api/sendSms", (req, res) => {
  const { message } = req.body;
  fast2sms
    .sendMessage({
      authorization: process.env.FAST_2_SMS_KEY,
      message: message,
      numbers: ["7972905284", "7769087531"],
    })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("Api is Running");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://meatloo.com",
      "http://localhost:3000",
      "http://192.168.1.207:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (orderId) => {
    console.log(orderId);
    socket.join(orderId);
  });
  console.log(socket.id);
});

eventEmmiter.on("productAdded", (data) => {
  io.to(`productAdded_${data.product._id}`).emit("productAdded", data);
  console.log(data);
});

eventEmmiter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
  console.log(data);
});

eventEmmiter.on("productUpdated", (data) => {
  io.to(`productBroadcast`).emit("productUpdated", data);
  console.log(data);
});

eventEmmiter.on("ordered", (data) => {
  io.to("broadcast").emit("ordered", data);
  console.log(data);
});

httpServer.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
