import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { config } from "dotenv";

config({
    path:"./.env"
})

const login = async (req, res) => {
    try {
        const { userId, password } = req.body;
        console.log(req.body)

        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(isPasswordValid)
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

        const role = user.role; 

        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role, 
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error)
    }
};

const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "Lax" });
    res.status(200).json({ message: "Logged out successfully" });
};

const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: process.env.MY_GMAIL, 
        pass: process.env.MY_GMAIL_PASSWORD, 
    },
});

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const emailId = email;

    try {
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" } // 24 hours validity
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

        const mailOptions = {
            from: process.env.MY_GMAIL,
            to: user.emailId,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        };

        console.log(mailOptions)
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the token expired
        const currentTime = Date.now() / 1000; // Convert to seconds
        console.log(currentTime , decoded.exp)
        if (currentTime > decoded.exp) {
            return res.status(400).json({ message: "Link has expired" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Invalid or expired token" });
    }
};

export { login, logout, forgotPassword, resetPassword };
