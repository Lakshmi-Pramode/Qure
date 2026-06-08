import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    currentToken: {
      type: Number,
      default: 0,
    },

    waitingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Queue = mongoose.model(
  "Queue",
  queueSchema
);

export default Queue;