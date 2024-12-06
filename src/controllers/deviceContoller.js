import Device from "../models/deviceModel.js";
import User from "../models/userModel.js"; 

// Function to fetch all devices
const allDevices = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

  try {
    // Calculate total records for pagination
    const total = await Device.countDocuments(); // Count all device records

    // Fetch paginated devices
    const devices = await Device.find()
      .skip((page - 1) * limit) // Skip documents based on the current page
      .limit(parseInt(limit)) // Limit the number of documents
      .populate('citizenId'); // Populate citizenId to include full details

    res.status(200).json({
      message: "Devices fetched successfully",
      data: devices,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching devices",
      error: error.message,
    });
  }
};

const createDevice = async (req, res) => {
  try {
    const { deviceNo, deviceMdl, deviceInfo } = req.body;

    // Create a new device without linking it to any user yet
    const newDevice = new Device({
      deviceNo,
      deviceMdl,
      deviceInfo,
      citizenId: [], // Empty citizenId array, device not assigned yet
    });

    // Save the new device
    const savedDevice = await newDevice.save();
    console.log("New device saved:", savedDevice);

    // Respond with the created device
    res.status(201).json({
      message: "Device created successfully",
      device: savedDevice,
    });
  } catch (error) {
    console.error("Error occurred:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};

const getDevice = async (req, res) => {
  try {
    const { id } = req.params; // Extract the device ID from the route parameter

    // Find the device by ID
    const device = await Device.findById(id);

    // If the device is not found, return a 404 error
    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    // Respond with the found device
    res.status(200).json({
      message: "Device retrieved successfully",
      device,
    });
  } catch (error) {
    console.error("Error occurred while retrieving the device:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};

const issueDevice = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from the URL parameter
    const { deviceId } = req.body; // Get the device ID from the request body

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user role is "CITIZEN"
    if (user.role !== "CITIZEN") {
      return res.status(400).json({ message: "Only CITIZEN users can receive devices" });
    }

    // Find the device by ID
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Issue the device to the user
    device.citizenId.push(user._id); // Add the user's ID to the device's citizenId array
    await device.save(); // Save the device with the new citizenId

    console.log("working")

    // Add the device to the user's deviceId array
    user.deviceId.push(device._id); // Add the device's ID to the user's deviceId array
    await user.save(); // Save the updated user

    console.log("working2")

    // Respond with success
    res.status(200).json({
      message: "Device issued successfully",
      device,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        emailId: user.emailId,
        deviceId: user.deviceId, // The user now has a reference to the issued device
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the device to be deleted
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Remove the device reference from the citizen's deviceId array
    const citizen = await User.findById(device.citizenId);
    if (citizen) {
      // Ensure deviceId is an array of ObjectIds and filter the matching device ID out
      citizen.deviceId = citizen.deviceId.filter((citizenDeviceId) => citizenDeviceId.toString() !== device._id.toString());
      await citizen.save();
      console.log("Device reference removed from citizen:", citizen);
    }

    // Delete the device
    await Device.deleteOne({ _id: id }); // Using deleteOne instead of remove
    console.log("Device deleted:", device);

    res.status(200).json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Error occurred:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};

const updateDevice = async (req, res) => {
  try {
    const { id } = req.params; // Extract device ID from the route parameters
    const updatedData = req.body; // Updated fields from the request body

    // Prevent modification of restricted fields (like deviceNo)
    if (updatedData.deviceNo) {
      return res.status(400).json({
        message: "Modification of deviceNo is not allowed.",
      });
    }

    // Find and update the device
    const updatedDevice = await Device.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedDevice) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({
      message: `Device updated successfully`,
      updatedDevice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export { allDevices, createDevice, getDevice, issueDevice, deleteDevice, updateDevice }