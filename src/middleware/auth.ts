import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.substring(7) : undefined;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, env.jwtSecret) as { id: string };
    const user = await User.findById(payload.id).select("_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = { id: user.id };
    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
