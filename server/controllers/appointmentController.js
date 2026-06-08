import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, hospitalId, appointmentDate } =
      req.body;

    const patientId = req.user._id;

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Count appointments for same doctor on same day
    const appointmentCount =
      await Appointment.countDocuments({
        doctorId,
        appointmentDate,
      });

    const tokenNumber = appointmentCount + 1;

    const estimatedWaitTime =
      appointmentCount *
      doctor.consultationTime;

    const appointment =
      await Appointment.create({
        patientId,
        doctorId,
        hospitalId,
        appointmentDate,
        tokenNumber,
        estimatedWaitTime,
      });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get My Appointments
export const getMyAppointments = async (
  req,
  res
) => {
  try {
    const appointments =
      await Appointment.find({
        patientId: req.user._id,
      })
        .populate("doctorId", "name specialization")
        .populate("hospitalId", "name address");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel Appointment
export const cancelAppointment = async (
  req,
  res
) => {
  try {
    const appointment =
      await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.status = "Cancelled";

    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin - Get All Appointments
export const getAllAppointments =
  async (req, res) => {
    try {
      const appointments =
        await Appointment.find()
          .populate(
            "patientId",
            "name email"
          )
          .populate(
            "doctorId",
            "name specialization"
          )
          .populate(
            "hospitalId",
            "name"
          );

      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };