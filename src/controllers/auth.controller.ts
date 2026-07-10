import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { User } from "../models/user.model.js";
import redisClient from "../config/redis.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY as string;
const JWT_EXPIRES_IN = "24h";
const BLACKLIST_TTL = 60 * 60 * 24;

function generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// register endpoint
export async function register(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists"
            });
            return;
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id.toString(), user.email);

        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


// login endpoint
export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
            return;
        }

        const token = generateToken(user._id.toString(), user.email);
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// logout endpoint
export async function logout(req: AuthRequest, res: Response): Promise<void> {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) {
            res.status(400).json({ success: false, message: "Token is required for logout." });
            return;
        }
        await redisClient.setex(`blacklist:${token}`, BLACKLIST_TTL, "true");
        
        res.status(200).json({
            success: true,
            message: "Logout successfully"
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}