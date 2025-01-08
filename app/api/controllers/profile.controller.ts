import { Context, RouterContext } from "@oak/oak";
import db from "../db.ts";
import { getUserInfoFromAuthHeader } from "../utils.ts";

export class ProfileController {
  async updateAvatar(ctx: Context) {
    try {
      const formData = await ctx.request.body.formData();
      const avatar = formData.get("avatar") as File;
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

      if (!avatar) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Missing required fields" };
        return;
      }

      const { ucid } = user;
      const name = avatar.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .toLowerCase();

      const fileName = `avatar-${ucid}-${name}`;
      const filePath = `avatars/${fileName}`;
      const content = await avatar.arrayBuffer();

      const { error: uploadError } = await db.storage
        .from("files")
        .upload(filePath, content, {
          contentType: avatar.type,
          upsert: true, // need this to replace the existing file
        });

      if (uploadError) {
        ctx.response.status = 500;
        ctx.response.body = {
          message: `Failed to upload image: ${uploadError.message}`,
        };
        return;
      }

      const { data: urlData } = db.storage.from("files").getPublicUrl(filePath);

      const { error: updateError } = await db
        .from("users")
        .update({
          avatar_url: urlData.publicUrl,
        })
        .eq("ucid", ucid);

      if (updateError) {
        console.error("User Update Error:", updateError);
        ctx.response.status = 404;
        ctx.response.body = { message: "User not found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Avatar updated successfully" };
    } catch (error) {
      console.error("Error updating avatar:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        message: "Internal server error while updating avatar",
      };
    }
  }

  async updateProfile(ctx: Context) {
    try {
      const data = await ctx.request.body.json();
      const full_name = data.fullName;
      const bio = data.bio;

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

      const { username } = user;

      if (!full_name || !bio) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Missing required fields" };
        return;
      }

      const { error } = await db
        .from("users")
        .update({ full_name, bio })
        .eq("username", username);

      if (error) {
        ctx.response.status = 404;
        ctx.response.body = { message: "User not found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Profile updated successfully" };
    } catch (error) {
      console.error("Error updating profile:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        message: "Internal server error while updating profile",
      };
    }
  }

  async getProfile(ctx: RouterContext<"/api/profile/:username">) {
    try {
      const username = ctx.params.username;

      const { data: userData, error: userError } = await db
        .from("users")
        .select("avatar_url, full_name, bio")
        .eq("username", username)
        .single();

      if (userError || !userData) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Profile not found." };
        return;
      }

      if (!userData.avatar_url) {
        ctx.response.status = 200;
        ctx.response.body = {
          fullName: userData.full_name,
          bio: userData.bio,
          avatar: null,
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        fullName: userData.full_name,
        bio: userData.bio,
        avatar: userData.avatar_url,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        message: "Internal server error while fetching profile",
      };
    }
  }
}
