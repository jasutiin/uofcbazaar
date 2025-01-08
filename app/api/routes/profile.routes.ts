import { Router } from "@oak/oak";
import { ProfileController } from "../controllers/profile.controller.ts";

const profileController = new ProfileController();
export const router = new Router();

router
  .put("/api/profile/avatar", profileController.updateAvatar)
  .get("/api/profile/:username", profileController.getProfile)
  .put("/api/profile", profileController.updateProfile);
