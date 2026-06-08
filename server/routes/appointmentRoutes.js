import express from "express";

import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
} from "../controllers/appointmentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Patient
router.post("/", protect, bookAppointment);

router.get("/my", protect, getMyAppointments);

router.put(
  "/cancel/:id",
  protect,
  cancelAppointment
);

// Admin
router.get("/", getAllAppointments);

export default router;