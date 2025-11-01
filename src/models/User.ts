import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  otpCodeHash?: string | null;
  otpExpiresAt?: Date | null;
  comparePassword(candidate: string): Promise<boolean>;
  setOtp(code: string, ttlMinutes?: number): Promise<void>;
  verifyOtp(code: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    otpCodeHash: { type: String, select: false, default: null },
    otpExpiresAt: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.setOtp = async function (code: string, ttlMinutes: number = 10) {
  const salt = await bcrypt.genSalt(10);
  this.otpCodeHash = await bcrypt.hash(code, salt);
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000);
  this.otpExpiresAt = expires;
};

UserSchema.methods.verifyOtp = async function (code: string) {
  if (!this.otpCodeHash || !this.otpExpiresAt) return false;
  if (this.otpExpiresAt.getTime() < Date.now()) return false;
  const ok = await bcrypt.compare(code, this.otpCodeHash);
  return ok;
};

export const User = mongoose.model<IUser>("User", UserSchema);
