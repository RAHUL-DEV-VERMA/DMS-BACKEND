import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { allDevices, createDevice, deleteDevice, getDevice, issueDevice, updateDevice } from "../controllers/deviceContoller.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { getCitizenDevice } from "../controllers/userContoller.js";

router.get("/all-devices", isLoggedIn, adminOnly,  allDevices);

router.get("/get-device/:id", isLoggedIn,  getDevice);

router.post("/create-device/", isLoggedIn, adminOnly,  createDevice);

router.post("/issue-device/:id", isLoggedIn, adminOnly,  issueDevice);

router.put("/update-device/:id", isLoggedIn, adminOnly,  updateDevice);

router.delete("/delete-device/:id", isLoggedIn, adminOnly,  deleteDevice); 

router.get("/device/:id", isLoggedIn,  getCitizenDevice); // Citizen can view their own devices

export default router;