import { Router } from "@oak/oak";
import { ChatController } from "../controllers/chat.controller.ts";

export const router = new Router();
const chatController = new ChatController();

router
  .post("/api/chat/create", chatController.createChat)
  .get("/api/chat/:id", chatController.getChat)
  .post("/api/messages", chatController.sendMessage)
  .get("/api/chats", chatController.getChats);
