const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  const conn = await mongoose.connect(mongoUri);
  isConnected = true;
  console.log(`MongoDB connected: ${conn.connection.host}`);

  return conn.connection;
};

module.exports = connectDB;
