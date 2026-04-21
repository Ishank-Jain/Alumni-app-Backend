require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");


const PORT = process.env.PORT || 8000;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in .env");
  }

  const connect = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected !! `);
};

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
