import express from "express";
import { upload, uploadFile } from "../controllers/UploadController.js";

const router = express.Router();

router.post("/", upload, uploadFile);

export default router;
