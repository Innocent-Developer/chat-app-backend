import { Router } from "express";
import { register, login, me, verifyOtp, resendOtp } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;
