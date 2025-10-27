import { Router } from "express";
import { accessChat, myChats } from "../controllers/chat.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, myChats);
router.post("/access", requireAuth, accessChat);

export default router;
