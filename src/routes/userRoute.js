import express from "express";
import {adminOnly} from "../middlewares/adminOnly.js";
import { dmOnly } from "../middlewares/dmOnly.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { changePassword, createUser, deleteUser, getAllAdmins, getAllCitizens, getAllDms, getProfile, getTotalCounts, updateUser } from "../controllers/userContoller.js";

const router = express.Router();

router.post("/create-user", isLoggedIn, adminOnly,  createUser);  // User creation

router.delete("/delete-user/:id", isLoggedIn, adminOnly,  deleteUser);  // user deletion

router.put("/update-user/:id", isLoggedIn, adminOnly,  updateUser);   // Update User

router.get("/profile/:id", isLoggedIn,  getProfile); // Citizen can get their own profile details

router.put("/change-password/:id", isLoggedIn,  changePassword); // Citizen can change their password

router.get("/citizens", isLoggedIn, dmOnly,  getAllCitizens);

router.get("/dms", isLoggedIn, adminOnly,  getAllDms);

router.get("/admins", isLoggedIn, adminOnly,  getAllAdmins);

router.get("/totals", isLoggedIn, adminOnly, getTotalCounts);

export default router;
