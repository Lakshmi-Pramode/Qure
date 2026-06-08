import Queue from "../models/Queue.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

// Create Queue for Doctor
export const createQueue = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const queue = await Queue.create({
      doctorId,
    });

    res.status(201).json(queue);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Queue By Doctor
export const getQueueByDoctor = async (
  req,
  res
) => {
  try {
    const queue = await Queue.findOne({
      doctorId: req.params.doctorId,
    }).populate(
      "doctorId",
      "name specialization"
    );

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    res.status(200).json(queue);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Current Token (Admin)
export const updateCurrentToken = async (
  req,
  res
) => {
  try {
    const { currentToken } = req.body;

    const queue =
      await Queue.findByIdAndUpdate(
        req.params.id,
        { currentToken },
        { new: true }
      );

    res.status(200).json(queue);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Patient Queue Status
export const getPatientQueueStatus =
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findById(
          req.params.appointmentId
        );

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      const queue = await Queue.findOne({
        doctorId: appointment.doctorId,
      });

      const doctor =
        await Doctor.findById(
          appointment.doctorId
        );

      const patientsAhead =
        appointment.tokenNumber -
        queue.currentToken -
        1;

      const estimatedWaitTime =
        patientsAhead *
        doctor.consultationTime;

      res.status(200).json({
        userToken:
          appointment.tokenNumber,
        currentToken:
          queue.currentToken,
        patientsAhead:
          patientsAhead < 0
            ? 0
            : patientsAhead,
        estimatedWaitTime,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };