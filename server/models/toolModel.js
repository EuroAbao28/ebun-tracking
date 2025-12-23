const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
  {
    toolName: {
      type: String,
      required: [true, "Tool name is required"],
      trim: true,
      minlength: [2, "Tool name must be at least 2 characters long"],
      maxlength: [50, "Tool name cannot exceed 50 characters"],
    },
    totalStocks: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Total stocks cannot be negative"],
    },
    inUse: {
      type: Number,
      default: 0,
      min: [0, "In-use quantity cannot be negative"],
    },
  },
  { timestamps: true }
);
const Tool = mongoose.model("Tool", toolSchema);
module.exports = Tool;
