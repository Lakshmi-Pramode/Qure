import express from "express";
import { adminProtect } from "../middleware/adminMiddleware.js";

import {
  getAdminStats,
  getAllAppointmentsAdmin,
  updateAppointmentStatus,
  rescheduleAppointment,
  getAllQueuesAdmin,
  advanceQueueToken,
  setQueueToken,
  skipPatient,
  getAnalyticsData,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes protected by admin middleware
router.use(adminProtect);

// Dashboard stats
router.get("/stats", getAdminStats);

// Appointments
router.get("/appointments", getAllAppointmentsAdmin);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.put("/appointments/:id/reschedule", rescheduleAppointment);

// Queues
router.get("/queues", getAllQueuesAdmin);
router.put("/queues/:id/advance", advanceQueueToken);
router.put("/queues/:id/set-token", setQueueToken);
router.put("/queues/:id/skip", skipPatient);

// Analytics
router.get("/analytics", getAnalyticsData);

export default router;
