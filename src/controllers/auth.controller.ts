import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import redisClient from "../config/redis.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY as string;
const JWT_EXPIRES_IN = "7d";
const BLACKLIST_TTL = 60 * 60 * 24 * 7;

function generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// register endpoint
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            throw new AppError("User already exists", 400);
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
       next(error);
    }
}


// login endpoint
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            throw new AppError("Invalid Credentials", 400);
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            throw new AppError("Invalid Credentials", 400);
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
        next(error);
    }
}

// logout endpoint
export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) {
            throw new AppError("No token provided", 400);
        }
        await redisClient.setex(`blacklist:${token}`, BLACKLIST_TTL, "true");
        
        res.status(200).json({
            success: true,
            message: "Logout successfully"
        });
    } catch (error) {
        next(error);
    }
}