import express from "express";

import {
  createQueue,
  getQueueByDoctor,
  updateCurrentToken,
  getPatientQueueStatus,
} from "../controllers/queueController.js";

const router = express.Router();

router.post("/", createQueue);

router.get(
  "/doctor/:doctorId",
  getQueueByDoctor
);

router.put(
  "/:id",
  updateCurrentToken
);

router.get(
  "/status/:appointmentId",
  getPatientQueueStatus
);

export default router;