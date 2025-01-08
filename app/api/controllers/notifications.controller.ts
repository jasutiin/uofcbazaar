import { Context, RouterContext } from "@oak/oak";
import db from "../db.ts";
import { getUserInfoFromAuthHeader } from "../utils.ts";

export class NotificationsController {
  // Get notifications for a specific user
  async getNotifications(ctx: Context) {
    try {
      let user = null;

      try {
        user = await getUserInfoFromAuthHeader(ctx.request.headers);
      } catch (_) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Invalid token" };
        return;
      }

      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          message: "Authorization header missing or invalid",
        };
        return;
      }

      const { ucid } = user;

      const { data: notifications, error } = await db
        .from("notifications")
        .select("id, message, timestamp, link, is_read, type")
        .eq("user_id", ucid)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to fetch notifications" };
        return;
      }

      if (!notifications) {
        ctx.response.status = 404;
        ctx.response.body = { message: "No notifications found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { notifications };
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to fetch notifications" };
    }
  }

  async deleteNotification(ctx: RouterContext<"/api/notifications/:id">) {
    const notificationId = ctx.params.id;
    try {
      const result = await db
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (result.error) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to delete notification" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Notification deleted successfully" };
    } catch (error) {
      console.error("Notif delete error: ", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to delete notification" };
    }
  }
}
