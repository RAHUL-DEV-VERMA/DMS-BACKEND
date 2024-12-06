import Device from "../models/deviceModel.js";
import User from "../models/userModel.js";

// Function to assign a Citizen to a Device
const assignCitizen = async (req, res) => {
  console.log("lfskfskfsklf")
  try {
    const { citizenId, deviceId } = req.body;

    // Validate the Citizen and Device
    const citizen = await User.findById(citizenId);
    const device = await Device.findById(deviceId);

    if (!citizen || citizen.role !== "CITIZEN") {
      return res.status(404).json({ message: "Citizen not found" });
    }

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Add Citizen ID to the Device's list if not already present
    if (!device.citizenId.includes(citizenId)) {
      device.citizenId.push(citizenId);
    }

    // Save the updated Device
    await device.save();

    res.status(200).json({ message: "Citizen assigned to Device successfully", device });
  } catch (error) {
    res.status(500).json({ message: "Error assigning citizen to device", error: error.message });
  }
};


const assignDevice = async (req, res) => {
    try {
      const { deviceId, citizenId } = req.body;
  
      // Check if both Device and Citizen exist
      const device = await Device.findById(deviceId);
      const citizen = await User.findById(citizenId);
  
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
  
      if (!citizen || citizen.role !== "CITIZEN") {
        return res.status(404).json({ message: "Citizen not found" });
      }
  
      // Map the Device to the Citizen
      if (!device.citizenId.includes(citizenId)) {
        device.citizenId.push(citizenId); // Add citizen to the device
      }
  
      if (!citizen.deviceId.includes(deviceId)) {
        citizen.deviceId.push(deviceId); // Add device to the citizen
      }
  
      // Save the updates
      await device.save();
      await citizen.save();
  
      res.status(200).json({ message: "Device assigned to Citizen successfully", device, citizen });
    } catch (error) {
      res.status(500).json({ message: "Error assigning device", error: error.message });
    }
  };


export {assignDevice, assignCitizen};