import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import userRoutes from "../src/api/routes/userRoutes.js";
import dryerRoutes from "../src/api/routes/dryersRoutes.js";
import reservationRoutes from "../src/api/routes/reservationsRoutes.js";
import uploadRoutes from "../src/api/routes/uploadRoutes.js";
import cropTypesRoutes from "../src/api/routes/cropTypesRoutes.js";

import { errorHandler } from "../src/api/middleware/errorHandler.js";
import { protect } from "../src/api/middleware/authMiddleware.js"; 

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/dryers", protect, dryerRoutes);
app.use("/api/reservations", protect, reservationRoutes);
app.use("/api/upload", protect, uploadRoutes);
app.use("/api/crop-types", protect, cropTypesRoutes);

app.use(errorHandler);

export default app;
