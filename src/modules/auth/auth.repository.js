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
};