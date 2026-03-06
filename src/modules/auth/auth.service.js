import { authRepository } from "./auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

const buildHttpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

export const register = async ({ email, password, fullName, username, phoneNumber, profilePicture, role }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) throw buildHttpError("Email already in use", 409);

  if (username) {
    const existingUsername = await authRepository.findByUsername(username);
    if (existingUsername) throw buildHttpError("Username already in use", 409);
  }

  if (phoneNumber) {
    const existingPhone = await authRepository.findByPhoneNumber(phoneNumber);
    if (existingPhone) throw buildHttpError("Phone number already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await authRepository.create({ 
    email, 
    password: hashedPassword,
    fullName,
    username,
    phoneNumber,
    profilePicture,
    role
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) throw buildHttpError("Invalid credentials", 401);

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw buildHttpError("Invalid credentials", 401);

  if (!JWT_SECRET) {
    throw buildHttpError("JWT secret not configured", 500);
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });
  
  const userObj = user.toObject();
  delete userObj.password;
  
  return { 
    token,
    user: userObj 
  };
};

export const updateProfilePicture = async (userId, profilePicture) => {
  const user = await authRepository.updateById(userId, { profilePicture });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const forgotPassword = async (email) => {
  const user = await authRepository.findByEmail(email);
  if (!user) return; // Don't reveal if email exists

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // TODO: Send email with reset link. For now, log to console.
  console.log(`Password reset token for ${email}: ${rawToken}`);
  console.log(`Reset link: http://localhost:3000/reset-password?token=${rawToken}`);

  return rawToken;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await authRepository.findByResetToken(hashedToken);

  if (!user) {
    throw buildHttpError("Invalid or expired reset token", 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};