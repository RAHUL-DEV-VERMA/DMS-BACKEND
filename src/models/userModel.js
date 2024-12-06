import mongoose from "mongoose";

// user schema definition
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  role:{
    type: String,
    enum : ["ADMIN", "DM", "CITIZEN"],
    required: true
  },
  firstName: {
    type: String,
    required: [true, "Please Enter First Name"],
  },
  lastName: {
    type: String,
    required: [true, "Please Enter Last Name"],
  },
  mobile: {
    type: String,
    required: [true, "Please Enter Your Mobile No"],
  },
  emailId: {
    type: String,
    required: [true, "Please Enter Email Id"],
    unique: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  aadharNo: {
    type: Number,
    unique: true,
    required: [true, "Please Enter Aadhar No"],
  },
  deviceId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
  password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
