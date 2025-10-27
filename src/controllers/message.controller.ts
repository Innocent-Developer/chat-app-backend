import { Request, Response } from "express";
import { Message } from "../models/Message";

export const sendMessage = async (req: Request, res: Response) => {
  const sender = (req as any).user.id as string;
  const { chatId, content } = req.body as { chatId: string; content: string };
  const msg = await Message.create({ sender, chat: chatId, content });
  res.status(201).json(msg);
};

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params as { chatId: string };
  const msgs = await Message.find({ chat: chatId }).populate("sender", "name email");
  res.json(msgs);
};
