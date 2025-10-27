import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb+srv://mughalabubakkarsa:mughal123@minetworks.steny.mongodb.net/flashchat",
  jwtSecret: process.env.JWT_SECRET || "changeme",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};
