import express from "express";
const router = express.Router();

import { assignCitizen, assignDevice } from "../controllers/mappingContoller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { adminOnly } from "../middlewares/adminOnly.js";

router.post("/assign-device", isLoggedIn, adminOnly, assignDevice);

router.post("/assign-citizen", isLoggedIn, adminOnly, assignCitizen);

export default router;