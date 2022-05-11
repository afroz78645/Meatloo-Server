import express from "express";
import cors from 'cors';
import { verify, Payment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.route("/").post(Payment);
router.post("/verification", verify);

export default router;
