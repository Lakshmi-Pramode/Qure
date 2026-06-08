import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Queue from "../models/Queue.js";
import User from "../models/User.js";

// ========================================
// DASHBOARD STATS
// ========================================
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalHospitals,
      totalDoctors,
      totalAppointments,
      totalPatients,
      queues,
      pendingAppointments,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      User.countDocuments({ role: "patient" }),
      Queue.find(),
      Appointment.countDocuments({ status: "Pending" }),
    ]);

    const totalWaiting = queues.reduce(
      (sum, q) => sum + q.waitingCount,
      0
    );

    const activeQueues = queues.filter(
      (q) => q.currentToken > 0 || q.waitingCount > 0
    ).length;

    // Calculate average wait time from today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppointments = await Appointment.find({
      appointmentDate: { $gte: today },
      status: { $in: ["Pending", "Approved"] },
    });

    const avgWaitTime =
      todayAppointments.length > 0
        ? Math.round(
            todayAppointments.reduce(
              (sum, a) => sum + (a.estimatedWaitTime || 0),
              0
            ) / todayAppointments.length
          )
        : 0;

    res.status(200).json({
      totalHospitals,
      totalDoctors,
      totalAppointments,
      totalPatients,
      totalWaiting,
      activeQueues,
      avgWaitTime,
      pendingAppointments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// APPOINTMENTS — GET ALL (ADMIN)
// ========================================
export const getAllAppointmentsAdmin = async (
  req,
  res
) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization consultationTime")
      .populate("hospitalId", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// APPOINTMENTS — UPDATE STATUS
// ========================================
export const updateAppointmentStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Approved",
      "Completed",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate("patientId", "name email")
        .populate("doctorId", "name specialization")
        .populate("hospitalId", "name");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// APPOINTMENTS — RESCHEDULE
// ========================================
export const rescheduleAppointment = async (
  req,
  res
) => {
  try {
    const { appointmentDate } = req.body;

    if (!appointmentDate) {
      return res.status(400).json({
        message: "New appointment date is required",
      });
    }

    const appointment =
      await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Recalculate token for the new date
    const appointmentCount =
      await Appointment.countDocuments({
        doctorId: appointment.doctorId,
        appointmentDate: new Date(appointmentDate),
        _id: { $ne: appointment._id },
      });

    const doctor = await Doctor.findById(
      appointment.doctorId
    );

    const tokenNumber = appointmentCount + 1;
    const estimatedWaitTime =
      appointmentCount *
      (doctor?.consultationTime || 15);

    const updated =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        {
          appointmentDate: new Date(appointmentDate),
          tokenNumber,
          estimatedWaitTime,
          status: "Pending",
        },
        { new: true }
      )
        .populate("patientId", "name email")
        .populate("doctorId", "name specialization")
        .populate("hospitalId", "name");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// QUEUES — GET ALL (ADMIN)
// ========================================
export const getAllQueuesAdmin = async (req, res) => {
  try {
    const queues = await Queue.find().populate(
      "doctorId",
      "name specialization hospitalId"
    );

    // For each queue, count waiting appointments
    const queuesWithDetails = await Promise.all(
      queues.map(async (queue) => {
        const waitingAppointments =
          await Appointment.countDocuments({
            doctorId: queue.doctorId?._id,
            status: { $in: ["Pending", "Approved"] },
            tokenNumber: { $gt: queue.currentToken },
          });

        return {
          ...queue.toObject(),
          waitingCount: waitingAppointments,
        };
      })
    );

    res.status(200).json(queuesWithDetails);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// QUEUES — ADVANCE TOKEN (NEXT)
// ========================================
export const advanceQueueToken = async (
  req,
  res
) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    queue.currentToken += 1;

    // Update waiting count
    const waitingCount =
      await Appointment.countDocuments({
        doctorId: queue.doctorId,
        status: { $in: ["Pending", "Approved"] },
        tokenNumber: { $gt: queue.currentToken },
      });

    queue.waitingCount = waitingCount;
    await queue.save();

    // Mark the current token's appointment as Completed
    await Appointment.findOneAndUpdate(
      {
        doctorId: queue.doctorId,
        tokenNumber: queue.currentToken - 1,
        status: { $in: ["Pending", "Approved"] },
      },
      { status: "Completed" }
    );

    const populated = await Queue.findById(
      queue._id
    ).populate(
      "doctorId",
      "name specialization"
    );

    res.status(200).json({
      ...populated.toObject(),
      waitingCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// QUEUES — SET SPECIFIC TOKEN
// ========================================
export const setQueueToken = async (req, res) => {
  try {
    const { currentToken } = req.body;

    if (
      currentToken === undefined ||
      currentToken < 0
    ) {
      return res.status(400).json({
        message:
          "Valid token number is required",
      });
    }

    const queue =
      await Queue.findByIdAndUpdate(
        req.params.id,
        { currentToken },
        { new: true }
      ).populate(
        "doctorId",
        "name specialization"
      );

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    // Recalculate waiting count
    const waitingCount =
      await Appointment.countDocuments({
        doctorId: queue.doctorId._id,
        status: { $in: ["Pending", "Approved"] },
        tokenNumber: { $gt: currentToken },
      });

    res.status(200).json({
      ...queue.toObject(),
      waitingCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// QUEUES — SKIP PATIENT
// ========================================
export const skipPatient = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID is required",
      });
    }

    // Mark appointment as Cancelled
    await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "Cancelled" }
    );

    // Advance queue token
    const queue = await Queue.findById(
      req.params.id
    );

    if (queue) {
      queue.currentToken += 1;

      const waitingCount =
        await Appointment.countDocuments({
          doctorId: queue.doctorId,
          status: { $in: ["Pending", "Approved"] },
          tokenNumber: { $gt: queue.currentToken },
        });

      queue.waitingCount = waitingCount;
      await queue.save();
    }

    res.status(200).json({
      message: "Patient skipped",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// ANALYTICS DATA
// ========================================
export const getAnalyticsData = async (
  req,
  res
) => {
  try {
    const now = new Date();

    // --- Daily appointments (last 7 days) ---
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count =
        await Appointment.countDocuments({
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        });

      dailyData.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // --- Weekly appointments (last 4 weeks) ---
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(
        weekEnd.getDate() - i * 7
      );
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(
        weekStart.getDate() - 6
      );
      weekStart.setHours(0, 0, 0, 0);

      const count =
        await Appointment.countDocuments({
          createdAt: {
            $gte: weekStart,
            $lte: weekEnd,
          },
        });

      weeklyData.push({
        label: `Week ${4 - i}`,
        count,
      });
    }

    // --- Monthly appointments (last 6 months) ---
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
        999
      );

      const count =
        await Appointment.countDocuments({
          createdAt: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        });

      monthlyData.push({
        label: monthStart.toLocaleDateString(
          "en-US",
          { month: "short" }
        ),
        count,
      });
    }

    // --- Doctor workload ---
    const doctors = await Doctor.find().select(
      "name specialization"
    );

    const doctorWorkload = await Promise.all(
      doctors.map(async (doc) => {
        const count =
          await Appointment.countDocuments({
            doctorId: doc._id,
          });

        return {
          name: doc.name,
          specialization: doc.specialization,
          appointments: count,
        };
      })
    );

    // Sort by appointment count descending
    doctorWorkload.sort(
      (a, b) => b.appointments - a.appointments
    );

    // --- Queue trends (average wait per day, last 7 days) ---
    const queueTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const appointments =
        await Appointment.find({
          createdAt: {
            $gte: date,
            $lt: nextDate,
          },
        });

      const avgWait =
        appointments.length > 0
          ? Math.round(
              appointments.reduce(
                (sum, a) =>
                  sum +
                  (a.estimatedWaitTime || 0),
                0
              ) / appointments.length
            )
          : 0;

      queueTrends.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        avgWaitTime: avgWait,
      });
    }

    res.status(200).json({
      dailyData,
      weeklyData,
      monthlyData,
      doctorWorkload,
      queueTrends,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
