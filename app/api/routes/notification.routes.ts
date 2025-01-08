import { Router } from "@oak/oak";
import { NotificationsController } from "../controllers/notifications.controller.ts";

export const router = new Router();
const notificationsController = new NotificationsController();

router.get("/api/notifications", notificationsController.getNotifications);
router.delete("/api/notifications/:id", notificationsController.deleteNotification);


