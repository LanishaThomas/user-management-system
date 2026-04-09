const app = require('../app');
const connectDB = require('../config/db');

let dbReady = false;

module.exports = async (req, res) => {
  try {
    if (!dbReady) {
      await connectDB();
      dbReady = true;
    }

    return app(req, res);
  } catch (error) {
    res.status(500).json({
      message: `Server startup failed: ${error.message}`
    });
  }
};
