import { Request, Response } from "express";
import { Chat } from "../models/Chat";
import { Types } from "mongoose";

export const myChats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const chats = await Chat.find({ users: new Types.ObjectId(userId) })
    .populate("users", "name email")
    .populate({ path: "latestMessage", populate: { path: "sender", select: "name email" } });
  res.json(chats);
};

export const accessChat = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const { user } = req.body as { user: string };
  let chat = await Chat.findOne({ isGroupChat: false, users: { $all: [userId, user] } });
  if (!chat) {
    chat = await Chat.create({ users: [userId, user] });
  }
  res.status(201).json(chat);
};
