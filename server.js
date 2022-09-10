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
import Shop from "./models/shopModel.js";
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


const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/api/getShopStatus", (req, res) => {
  Shop.findById("62b85dcd9b010b18945b99c5", (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/api/setShopStatus", async (req, res) => {
  const shopStaus = req.body;
  const newStaus = new Shop(shopStaus);
  await newStaus.save();
  const eventEmmiter = req.app.get("eventEmmiter");
  eventEmmiter.emit("shopUpdated", { data: newStaus });
  res.json(newStaus);
});

app.put("/api/editShopStatus", async (req, res) => {
  const shop = await Shop.findById("62b85dcd9b010b18945b99c5");
  const { isOpen } = req.body;
  if (shop) { 
    shop.isOpen = isOpen;
    const updatedShop = await shop.save();
    res.json(updatedShop);
    const eventEmmiter = req.app.get("eventEmmiter");
    eventEmmiter.emit("shopUpdated", { data: updatedShop });
  } else {
    res.status(404);
    throw new Error("Error Something Went Wrong");
  }
});

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
  io.to(`productBroadcast`).emit("productAdded", data);
  console.log(data);
});

eventEmmiter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
  console.log(data);
});

eventEmmiter.on("productUpdated", (data) => {
  io.to(`product_${data.id}`).emit("productUpdated", data);
  console.log(data);
});

eventEmmiter.on("ordered", (data) => {
  io.to("broadcast").emit("ordered", data);
  console.log(data);
});

eventEmmiter.on("shopUpdated", (data) => {
  io.to("broadcastShop").emit("shopUpdated", data);
  console.log("Shop Status Updated");
});

eventEmmiter.on("deletedProduct", (data) => {
  io.to("broadcastDeleteProduct").emit("deletedProduct", data);
  console.log(data);
});

httpServer.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
