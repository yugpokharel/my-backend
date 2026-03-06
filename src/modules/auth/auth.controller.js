import * as authService from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.dto.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    
    if (allowedMimes.includes(mimeType) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files (JPEG, PNG, GIF, WebP) are allowed. Got: ${mimeType}`));
    }
  }
});

export const register = async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      }
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: parseResult.error.flatten()
      });
    }

    const { email, password, fullName, username, phoneNumber, role } = parseResult.data;
    const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    console.log("File info:", req.file); 
    console.log("Body:", req.body);

    const user = await authService.register({
      email,
      password,
      fullName,
      username,
      phoneNumber,
      profilePicture,
      role
    });

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      user 
    });
  } catch (err) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: parseResult.error.flatten()
      });
    }

    const result = await authService.login(parseResult.data);
    res.status(200).json({ 
      success: true, 
      token: result.token,
      data: result.user  
    });
  } catch (err) {
    next(err);
  }
};

export const uploadMiddleware = upload.single("profilePicture");

export const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const newPath = `/uploads/profiles/${req.file.filename}`;

    // Delete old profile picture if it exists
    const oldPicture = req.user.profilePicture;
    if (oldPicture) {
      try {
        // oldPicture is like "/uploads/profiles/file.jpg", strip leading slash for fs path
        await fs.unlink(oldPicture.replace(/^\//, ""));
      } catch (unlinkErr) {
        // Old file may not exist, that's fine
        console.error("Error deleting old profile picture:", unlinkErr.message);
      }
    }

    // Update user in DB
    const user = await authService.updateProfilePicture(req.user._id, newPath);

    res.status(200).json({ data: { profilePicture: user.profilePicture } });
  } catch (err) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await authService.forgotPassword(email);

    res.status(200).json({ message: "Password reset instructions sent to your email" });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    await authService.verifyOtp(email, otp);

    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and password are required" });
    }

    await authService.resetPassword(email, otp, password);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};