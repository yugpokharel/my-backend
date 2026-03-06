import express from "express";
import { register, login, uploadMiddleware, updateProfilePicture, forgotPassword, verifyOtp, resetPassword } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

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
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.put("/profile-picture", protect, uploadMiddleware, handleMulterError, updateProfilePicture);

export default router;