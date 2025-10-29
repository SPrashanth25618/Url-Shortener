// models/url.js
import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, index: true, unique: true },
    createdAt: { type: Date, default: () => new Date() },
    clicks: { type: Number, default: 0 },
    // link to the user who created this short URL
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const Url = mongoose.model("Url", urlSchema);
export default Url;
