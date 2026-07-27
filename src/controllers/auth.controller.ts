import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import redisClient from "../config/redis.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_SECRET_KEY as string
const JWT_REFRESH_SECRET= process.env.JWT_REFRESH_SECRET_KEY as string;


const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRE = "7d";

const BLACKLIST_TTL = 60 * 15;
const REFRESH_TTL = 60 * 60 * 24 * 7; 

function generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
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
        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const refreshToken = generateRefreshToken(user._id.toString(), user.email);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TTL * 1000
        });

        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            accessToken,
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

        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const refreshToken = generateRefreshToken(user._id.toString(), user.email);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TTL * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
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

// refresh token endpoint
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if(!refreshToken) {
            throw new AppError("No refresh Token Provided", 401);
        }

        const isBlackListed = await redisClient.get(`blacklist:${refreshToken}`);
        if(isBlackListed) {
            throw new AppError("Refresh Token is blacklisted, access denied", 401);
        }

        const decoded = jwt.verify(refreshToken ,JWT_REFRESH_SECRET) as {
            userId: string;
            email: string;
        };

        const newAccessToken = generateAccessToken(decoded.userId, decoded.email);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (error) {
        next(error);
    }
}

// logout endpoint
export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];
        if(!accessToken) {
            throw new AppError("No token provided", 400);
        }
        await redisClient.setex(`blacklist:${accessToken}`, BLACKLIST_TTL, "true");

        const refreshToken = req.cookies?.refreshToken;
        if(refreshToken) {
            await redisClient.setex(`blacklist:${refreshToken}`, REFRESH_TTL, "true");
        }
        
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
}