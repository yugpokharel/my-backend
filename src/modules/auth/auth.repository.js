import User from "./user.model.js";

export const authRepository = {
  findByEmail: async (email) => {
    return await User.findOne({ email });
  },

  findByUsername: async (username) => {
    return await User.findOne({ username });
  },

  findByPhoneNumber: async (phoneNumber) => {
    return await User.findOne({ phoneNumber });
  },

  create: async (data) => {
    return await User.create(data);
  },

  updateById: async (id, data) => {
    return await User.findByIdAndUpdate(id, data, { new: true }).select("-password");
  },

  findByResetToken: async (hashedToken) => {
    return await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  },

  findByEmailAndResetToken: async (email, hashedToken) => {
    return await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  },
};