const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Start MongoDB Memory Server for development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      console.log("Starting MongoDB Memory Server...");
      console.log("Connecting to DB...", mongoUri);
      
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        retryWrites: true,
        maxPoolSize: 10
      });
      
      console.log("DB Connected (Memory Server)");
    } catch (err) {
      console.log("Memory Server Error:", err.message);
      process.exit(1);
    }
  } else {
    // Production: use Atlas
    console.log("Connecting to DB...", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      maxPoolSize: 10
    })
      .then(() => console.log("DB Connected (Atlas)"))
      .catch(err => {
        console.log("DB Connection Error:", err.message);
        process.exit(1);
      });
  }
};

startServer();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(5000, () => console.log("Server running on port 5000"));