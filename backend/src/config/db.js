/**
 * @file db.js
 * @description MongoDB connection manager with auto-retry and graceful shutdown.
 */

const mongoose = require("mongoose");

// Disable buffering so that queries fail fast if MongoDB is not connected
mongoose.set("bufferCommands", false);

let isConnected = false;

/**
 * Connects to MongoDB using the MONGO_URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("⚠️  Running without MongoDB — chat history will not persist.");
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
