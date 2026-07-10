import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const headers = req.headers.authorization;
    if(!headers || !headers.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = headers.split(" ")[1] as string;

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if(isBlacklisted) {
        return res.status(401).json({
            message: "Token is blacklisted, access denied"
        });
    }

    const secret = process.env.JWT_SECRET_KEY as string;

    const decoded = jwt.verify(token, secret) as unknown as { userId: string; email: string };
    req.user = decoded;
    next();
}
 
