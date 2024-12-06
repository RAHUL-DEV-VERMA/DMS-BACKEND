import Device from "../models/deviceModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const createUser = async (req, res) => {
  try {

    const { firstName, lastName, role, mobile, emailId, gender, aadharNo } = req.body;

    // Check if admin already exists
    const existingUser = await User.findOne({
      $or: [
        { emailId },
        { mobile },
        { aadharNo },
      ],
    });

    console.log("Existing User:", existingUser); // Log existing user if found

    if (existingUser) {
      return res.status(400).json({ message: "User with this email, mobile, or Aadhar already exists" });
    }

    const password = mobile;
    const hashedPassword = await bcrypt.hash(password, 10);

    let userId;
    let isUnique = false;

    // Generate a unique userId
    while (!isUnique) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
      userId = `${firstName.slice(0, 3).toUpperCase()}${randomDigits}`; // Combine first 3 letters of firstName and random digits
      const userIdExists = await User.findOne({ userId }); // Check if this userId already exists
      if (!userIdExists) {
        isUnique = true; // If no userId exists, it's unique
      }
    }

    const newUser = new User({
      firstName,
      lastName,
      role,
      mobile,
      emailId,
      gender,
      aadharNo,
      password: hashedPassword,
      userId,
    });

    const user = await newUser.save();
    console.log("New User Created:", user); // Log user created

    res.status(201).json({
      message: `${role} created successfully`,
      redirectTo: '/device-issue', // Add the redirect path here
      user,
    });
  } catch (error) {
    console.error("Error in createUser:", error.message); // Log actual error
    res.status(500).json({ message: "Error creating User", error: error.message });
  }
};


const deleteUser = async (req, res) => {
  console.log("delete hitting")
  try {
    const { id } = req.params;

    // Find and delete the admin by ID
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Check if the update is attempting to modify restricted fields
    if (updatedData.emailId || updatedData.mobile || updatedData.aadharNo) {
      return res.status(400).json({
        message: "Modification of emailId, mobile number, or aadharNo is not allowed."
      });
    }

    // Find and update the citizen
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User updated successfully`, updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("deviceId"); // Populate device details
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the device details of a specific citizen
const getCitizenDevice = async (req, res) => {
  try {
    const citizen = await User.findById(req.params.id).populate("deviceId");
    if (!citizen) return res.status(404).json({ message: "Citizen not found" });

    res.status(200).json({ devices: citizen.deviceId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// Change password for a citizen after confirming the previous password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id = ", id);
    const { oldPassword, newPassword } = req.body;

    console.log(req.body);

    const user = await User.findById(id); // Find the user by ID
    if (!user) return res.status(404).json({ message: "User not found " });

    // Log the password and hashed password to see what's happening
    console.log("Old Password Entered:", oldPassword);
    console.log("Hashed Password from DB:", user.password);

    // Check if the old password matches
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    console.log("Working")
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Please Enter Correct Password!" });
    }

    // Encrypt the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
};

const getAllCitizens = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

  try {
    // Filter only CITIZEN roles
    const query = { role: "CITIZEN" };

    // Pagination logic
    const total = await User.countDocuments(query); // Total number of CITIZEN records
    const citizens = await User.find(query)
      .skip((page - 1) * limit) // Skip documents for pagination
      .limit(parseInt(limit)); // Limit number of documents


    res.status(200).json({
      data: citizens,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is specified
    const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 users per page

    const dms = await User.find({ role: 'DM' }) // Filter users with role 'DM'
      .skip((page - 1) * pageSize) // Skip users based on page number and page size
      .limit(pageSize); // Limit the number of users per page

    const totalDms = await User.countDocuments({ role: 'DM' }); // Get the total count of DMs
    const totalPages = Math.ceil(totalDms / pageSize); // Calculate total pages

    res.status(200).json({
      dms,
      totalPages,
      currentPage: page,
      totalDms,
    });
  } catch (error) {
    console.error('Error fetching DMs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is specified
    const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 users per page

    const admins = await User.find({ role: 'ADMIN' }) // Filter users with role 'DM'
      .skip((page - 1) * pageSize) // Skip users based on page number and page size
      .limit(pageSize); // Limit the number of users per page

    const totalAdmins = await User.countDocuments({ role: 'ADMIN' }); // Get the total count of DMs
    const totalPages = Math.ceil(totalAdmins / pageSize); // Calculate total pages

    res.status(200).json({
      admins,
      totalPages,
      currentPage: page,
      totalAdmins,
    });
  } catch (error) {
    console.error('Error fetching ADMIN:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTotalCounts = async (req, res) => {
  try {
    // Get counts of users by role
    const totalDM = await User.countDocuments({ role: "DM" });
    const totalAdmin = await User.countDocuments({ role: "ADMIN" });
    const totalCitizen = await User.countDocuments({ role: "CITIZEN" });

    // Get the count of devices
    const totalDevices = await Device.countDocuments();

    res.status(200).json({
      totalDM,
      totalAdmin,
      totalCitizen,
      totalDevices,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export { createUser, deleteUser, updateUser, getProfile, changePassword, getCitizenDevice, getAllCitizens, getAllDms, getAllAdmins, getTotalCounts }
