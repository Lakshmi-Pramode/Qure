import Doctor from "../models/Doctor.js";

// Add Doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate(
      "hospitalId",
      "name address"
    );

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Doctor By ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(
      req.params.id
    ).populate("hospitalId");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Doctors By Hospital
export const getDoctorsByHospital = async (
  req,
  res
) => {
  try {
    const doctors = await Doctor.find({
      hospitalId: req.params.hospitalId,
    });

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Doctor
export const updateDoctor = async (req, res) => {
  try {
    const doctor =
      await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Doctor
export const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Doctor deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};