import express from "express";
import {config} from "dotenv";
import connectDB from "./src/utils/feature.js";
import userRoute from "./src/routes/userRoute.js"
import deviceRoute from "./src/routes/deviceRoute.js"
import loginLogoutRoute from "./src/routes/loginLogoutRoute.js"
import mappingRoute from "./src/routes/mappingRoute.js"
import cors from "cors";

const app = express();

// const allowedOrigins = ["http://172.18.1.117:5173"]; // Frontend origin
const allowedOrigins = ["http://localhost:5173"]; // Frontend origin
app.use(
  cors({
    origin: allowedOrigins, // Only allow specific origin
    credentials: true, // Allow cookies to be sent
  })
);

config({
    path:"./.env"
})
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI);

// Middleware
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("api working on /api/v1/");
});

// Routes
app.use("/api/v1/user", userRoute, deviceRoute, mappingRoute, loginLogoutRoute, );

app.listen(PORT, ()=>{
    console.log(`Server listening successfully on http://localhost:${PORT}`);
})
