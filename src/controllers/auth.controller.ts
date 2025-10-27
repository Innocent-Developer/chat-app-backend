import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

const sign = (id: string) => jwt.sign({ id }, env.jwtSecret, { expiresIn: "7d" });

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const user = await User.create({ name, email, password });
  const token = sign(user.id);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password name email");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = sign(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const me = async (req: Request, res: Response) => {
  const { id } = (req as any).user as { id: string };
  res.json({ id });
};
