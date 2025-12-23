const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);

    console.log(`MongoDB Connected: ${conn.connection.name}`.cyan.underline);
  } catch (error) {
    console.error("MongoDB connection error:".trimEnd.underline, error);
    process.exit(1);
  }
};

module.exports = connectDB;
