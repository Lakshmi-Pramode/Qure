/**
 * ====================================================
 * APPOINTMENT MODEL — Updated for Razorpay Payments
 * ====================================================
 *
 * 📚 WHAT'S NEW?
 * Added fields to track payment status and consultation type:
 *
 * - consultationType: "In-Person" (default) or "Video Call"
 *   Video calls cost extra (doctor's fee + ₹200 surcharge)
 *
 * - consultationFee: Stores the fee AT BOOKING TIME
 *   Why? Because the doctor might change their fee later,
 *   but you already paid a specific amount
 *
 * - paymentStatus: Tracks if the patient has paid
 *   "Pending" → "Paid" → or "Failed"
 *
 * - razorpayOrderId: Razorpay's unique order identifier
 *   Created when we call Razorpay API to create an order
 *
 * - razorpayPaymentId: Razorpay's payment confirmation ID
 *   Set after successful payment & verification
 */

import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    estimatedWaitTime: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    // NEW: Payment & Consultation fields
    consultationType: {
      type: String,
      enum: ["In-Person", "Video Call"],
      default: "In-Person",
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;