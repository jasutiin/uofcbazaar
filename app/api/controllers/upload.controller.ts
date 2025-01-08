import { Context } from "@oak/oak";
import db from "../db.ts";
import { getUserInfoFromAuthHeader } from "../utils.ts";

export async function uploadProduct(ctx: Context) {
  const formData = (await ctx.request.body.formData()) as FormData;

  const title = formData.get("title") as string;
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const productImages = formData.getAll("files") as File[];

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
    ctx.response.body = { message: "Authorization header missing or invalid" };
    return;
  }

  const { ucid } = user;

  try {
    const { data: listingData, error: insertError } = await db
      .from("listings")
      .insert([
        {
          user_id: ucid,
          category,
          title,
          description,
          price,
          item_condition: "new",
          is_available: true,
        },
      ])
      .select();

    if (insertError || !listingData) {
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to insert product details" };
      return;
    }

    const listingId = listingData[0]!.listing_id;

    for (const [index, image] of productImages.entries()) {
      const content = await image.arrayBuffer();
      const name = image.name
        .replace(/ /g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .toLowerCase();

      const paddedIndex = String(index + 1).padStart(2, "0");
      const filePath = `listings/${listingId}_${paddedIndex}_${name}`;

      const { error: uploadError } = await db.storage
        .from("files")
        .upload(filePath, content, {
          contentType: image.type,
        });

      if (uploadError) {
        ctx.response.status = 500;
        ctx.response.body = {
          message: `Failed to upload image: ${uploadError.message}`,
        };
        return;
      }
    }

    ctx.response.status = 201;
    ctx.response.body = { message: "Product uploaded successfully" };
  } catch (error) {
    console.error("Failed to insert product:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to upload product" };
  }
}
