import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  deviceNo: {
    type: String,
    required: true,
    unique: true,
  },
  deviceMdl: {
    type: String,
    required: true,
  },
  deviceInfo: {
    type: String,
    required: true,
  },
  citizenId: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
],
}, {
  timestamps: true,
});

const deviceModel = mongoose.model("Device", deviceSchema);

export default deviceModel;