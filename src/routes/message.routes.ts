import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:chatId", requireAuth, getMessages);
router.post("/", requireAuth, sendMessage);

export default router;
