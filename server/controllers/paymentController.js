/**
 * ====================================================
 * PAYMENT CONTROLLER — Simulated Payment System
 * ====================================================
 *
 * 📚 WHAT IS THIS?
 * A mock payment system that simulates real payment processing
 * WITHOUT needing Razorpay, Stripe, or any third-party service.
 *
 * Perfect for project demos and learning!
 * The flow is identical to a real payment gateway:
 *   1. Create an order (generates a mock order ID)
 *   2. Frontend shows payment popup (simulated)
 *   3. Verify payment (mock signature verification)
 *   4. Mark appointment as "Paid"
 *
 * 💡 In production, you'd replace this with real Razorpay/Stripe.
 *    The API structure is the same — just swap the internals.
 */

import crypto from "crypto";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

// Video call surcharge (₹200 extra on top of doctor's fee)
const VIDEO_CALL_SURCHARGE = 200;

// Secret key for mock signature generation (simulates Razorpay's key)
const MOCK_SECRET = "qure_mock_payment_secret_key";

/**
 * CREATE ORDER
 * Generates a mock order ID and saves appointment (unpaid)
 */
export const createOrder = async (req, res) => {
  try {
    const { doctorId, hospitalId, appointmentDate, consultationType } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !hospitalId || !appointmentDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Calculate total fee
    const isVideoCall = consultationType === "Video Call";
    const baseFee = doctor.consultationFee;
    const totalFee = isVideoCall ? baseFee + VIDEO_CALL_SURCHARGE : baseFee;

    // Count existing appointments for token number
    const appointmentCount = await Appointment.countDocuments({
      doctorId,
      appointmentDate,
    });
    const tokenNumber = appointmentCount + 1;
    const estimatedWaitTime = appointmentCount * doctor.consultationTime;

    // Generate mock order ID (simulates Razorpay's order ID format)
    const mockOrderId = `order_${crypto.randomBytes(12).toString("hex")}`;

    // Save appointment with "Pending" payment status
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      hospitalId,
      appointmentDate,
      tokenNumber,
      estimatedWaitTime,
      consultationType: isVideoCall ? "Video Call" : "In-Person",
      consultationFee: totalFee,
      paymentStatus: "Pending",
      razorpayOrderId: mockOrderId,
    });

    res.status(201).json({
      orderId: mockOrderId,
      amount: totalFee * 100, // In paise (same format as Razorpay)
      currency: "INR",
      appointmentId: appointment._id,
      tokenNumber,
      estimatedWaitTime,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * VERIFY PAYMENT
 * Validates mock signature and marks appointment as Paid
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, appointmentId } = req.body;

    // Verify the mock signature (same HMAC logic as Razorpay)
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", MOCK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: "Failed",
      });
      return res.status(400).json({ message: "Payment verification failed." });
    }

    // Payment verified — update appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentStatus: "Paid",
        razorpayPaymentId: paymentId,
        status: "Approved",
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Payment verified successfully!",
      appointment,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GENERATE MOCK SIGNATURE
 * Frontend calls this to get a valid signature for the mock payment
 * (In real Razorpay, their servers generate this)
 */
export const generateMockSignature = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    const body = orderId + "|" + paymentId;
    const signature = crypto
      .createHmac("sha256", MOCK_SECRET)
      .update(body)
      .digest("hex");

    res.status(200).json({ signature });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
