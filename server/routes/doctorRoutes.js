import express from "express";

import {
  createDoctor,
  getDoctors,
  getDoctorById,
  getDoctorsByHospital,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/", createDoctor);

router.get("/", getDoctors);

router.get("/hospital/:hospitalId", getDoctorsByHospital);

router.get("/:id", getDoctorById);

router.put("/:id", updateDoctor);

router.delete("/:id", deleteDoctor);

export default router;