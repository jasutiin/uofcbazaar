import { Router } from "@oak/oak";
import { uploadProduct } from "../controllers/upload.controller.ts";

export const router = new Router();

router.post("/api/upload", uploadProduct);
