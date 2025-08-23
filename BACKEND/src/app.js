import express from "express";
import dotenv from "dotenv";
import userRoutes from "../src/api/routes/userRoutes.js";
import { errorHandler } from "../src/api/middleware/errorHandler.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);

// Error handling
app.use(errorHandler);

export default app;
