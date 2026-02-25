import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  fullName: {
    type: String,
    default: ""
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined
  },
  profilePicture: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["customer", "owner", "admin"],
    default: "customer"
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;