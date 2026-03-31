import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔹 SIGNUP
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password
    });

    res.json({ message: "User created" });
};


// 🔹 LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) return res.status(400).json("Invalid password");

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token as cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "strict"
    });

    res.json({ accessToken });
};
// 🔹 REFRESH TOKEN
export const refreshTokenHandler = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json("No refresh token");

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json("Invalid refresh token");
        }

        const newAccessToken = await user.generateAccessToken();

        res.json({ accessToken: newAccessToken });

    } catch (err) {
        res.status(403).json("Token expired");
    }
};
// 🔹 LOGOUT
export const logout = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.sendStatus(204);

    const user = await User.findOne({ refreshToken: token });

    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
};