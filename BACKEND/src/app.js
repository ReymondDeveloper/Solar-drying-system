import express from "express";
import dotenv from "dotenv"
import userRoutes from "../src/api/routes/userRoutes.js";
import { errorHandler } from "../src/api/middleware/errorHandler.js";

dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Error handling
app.use(errorHandler);

export default app;