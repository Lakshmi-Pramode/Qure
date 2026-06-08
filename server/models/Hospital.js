import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    contact: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    departments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model(
  "Hospital",
  hospitalSchema
);

export default Hospital;