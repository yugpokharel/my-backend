import express from "express";
import { register, login, uploadMiddleware } from "./auth.controller.js";

const router = express.Router();

const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("Multer error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error"
    });
  }
  next();
};

// Routes
router.post("/register", uploadMiddleware, handleMulterError, register);
router.post("/login", login);

export default router;