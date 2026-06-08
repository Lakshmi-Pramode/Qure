import express from "express";
import { createOrder, verifyPayment, generateMockSignature } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/mock-signature", protect, generateMockSignature);

export default router;
