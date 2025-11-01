import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "../services/mailer";

const sign = (id: string) => jwt.sign({ id }, env.jwtSecret, { expiresIn: "7d" });

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const user = await User.create({ name, email, password });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await (user as any).setOtp(otp, 10);
  await user.save();
  console.log(`[OTP] Sent code ${otp} to ${user.email}`);
  let emailed = false;
  try {
    emailed = await sendOtpEmail(user.email, otp);
  } catch (e) {
    emailed = false;
  }
  res.status(201).json({ message: emailed ? "OTP sent to email" : "OTP generated", emailed, email: user.email });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password name email isVerified");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  if (!(user as any).isVerified) return res.status(403).json({ message: "Account not verified" });
  const token = sign(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const me = async (req: Request, res: Response) => {
  const { id } = (req as any).user as { id: string };
  res.json({ id });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, code } = req.body as { email: string; code: string };
  const user = await User.findOne({ email }).select("name email isVerified otpCodeHash otpExpiresAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  if ((user as any).isVerified) return res.json({ message: "Already verified" });
  const ok = await (user as any).verifyOtp(code);
  if (!ok) return res.status(400).json({ message: "Invalid or expired code" });
  (user as any).isVerified = true;
  (user as any).otpCodeHash = null;
  (user as any).otpExpiresAt = null;
  await user.save();
  const token = sign(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email }).select("email isVerified otpCodeHash otpExpiresAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  if ((user as any).isVerified) return res.status(400).json({ message: "Already verified" });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await (user as any).setOtp(otp, 10);
  await user.save();
  console.log(`[OTP] Resent code ${otp} to ${user.email}`);
  let emailed = false;
  try {
    emailed = await sendOtpEmail(user.email, otp);
  } catch (e) {
    emailed = false;
  }
  res.json({ message: emailed ? "OTP sent to email" : "OTP generated", emailed, email: user.email });
};
