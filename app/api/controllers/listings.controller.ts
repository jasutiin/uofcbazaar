import { Context, RouterContext } from "@oak/oak";
import db from "../db.ts";
import { getUserInfoFromAuthHeader } from "../utils.ts";

export class ListingsController {
  async getListings(ctx: Context) {
    try {
      const params = ctx.request.url.searchParams;
      const categories = params.getAll("categories");
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      const page = parseInt(params.get("page") || "1", 10);
      const pageSize = parseInt(params.get("pageSize") || "10", 10);
      const offset = (page - 1) * pageSize;

      const encodedCategories = categories.map((category) =>
        // Replace the space with a "-", and make the first letter after the "-" a lowercase letter
        category
          .replace(/ /g, "-")
          .replace(
            /-([A-Z])?/g,
            (_, letter) => `-${letter ? letter.toLowerCase() : ""}`,
          ),
      );

      let user = null;

      try {
        user = await getUserInfoFromAuthHeader(ctx.request.headers);
      } catch (_) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Invalid token" };
        return;
      }

      let query;

      if (user && encodedCategories.includes("Following")) {
        const { ucid } = user;
        const { data: follows, error: followsError } = await db
          .from("listing_follows")
          .select("listing_id")
          .eq("user_id", ucid);

        if (followsError) {
          ctx.response.status = 500;
          ctx.response.body = { message: "Failed to fetch follows" };
          return;
        }

        const followedListingIds = follows.map((follow) => follow.listing_id);

        query = db
          .from("listings")
          .select("*, seller:users(username, avatar_url)")
          .in("listing_id", followedListingIds);

        if (encodedCategories.length > 1) {
          query = query.in(
            "category",
            encodedCategories.filter((c) => c !== "following"),
          );
        }
      } else {
        query = db
          .from("listings")
          .select("*, seller:users(username, avatar_url)")
          .eq("is_available", true);

        if (encodedCategories.length > 0) {
          query = query.in("category", encodedCategories);
        }
      }

      if (minPrice) query = query.gte("price", parseFloat(minPrice).toFixed(2));
      if (maxPrice) query = query.lte("price", parseFloat(maxPrice).toFixed(2));

      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1)
        .limit(pageSize);

      const { data: listings, error } = await query;

      if (error) {
        console.error("Failed to fetch listings:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to fetch listings" };
        return;
      }

      const listingsWithImages = await Promise.all(
        // @ts-ignore: type
        listings.map(async (listing) => {
          try {
            // List all files in the bucket for this listing
            const { data: searchFiles, error: filesError } = await db.storage
              .from("files")
              .list("listings", {
                offset: 0,
                search: `${listing.listing_id}_`,
                sortBy: { column: "name", order: "asc" },
              });

            if (filesError) {
              ctx.response.status = 500;
              ctx.response.body = { message: "Failed to fetch listing images" };
              return;
            }

            const files = searchFiles?.filter((file) =>
              file.name.startsWith(`${listing.listing_id}_`),
            );

            // Generate full URLs for the images
            const images = files.map((file) => ({
              filename: file.name,
              url: db.storage
                .from("files")
                .getPublicUrl(`listings/${file.name}`).data.publicUrl,
            }));

            return {
              ...listing,
              images: images,
            };
          } catch (error) {
            console.error(
              `Error processing images for listing_id=${listing.listing_id}:`,
              error,
            );
            return {
              ...listing,
              images: [],
            };
          }
        }),
      );

      ctx.response.status = 200;
      ctx.response.body = { listings: listingsWithImages };
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to fetch listings" };
    }
  }

  async getListing(ctx: RouterContext<"/api/listings/:id">) {
    try {
      const id = ctx.params.id;

      const { data: listingData, error: listingError } = await db
        .from("listings")
        .select("*, seller:users(username, avatar_url)")
        .eq("listing_id", id)
        .single();

      if (listingError || !listingData) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Listing not found" };
        return;
      }

      const { data: searchFiles, error: filesError } = await db.storage
        .from("files")
        .list("listings", {
          offset: 0,
          search: `${id}_`,
          sortBy: { column: "name", order: "asc" },
        });

      if (filesError) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to fetch listing images" };
        return;
      }

      const files = searchFiles?.filter((file) =>
        file.name.startsWith(`${id}_`),
      );

      const listingImages =
        files?.filter((file) => file.name.startsWith(`${id}_`)) || [];
      const images = listingImages.map((file) => ({
        filename: file.name,
        url: db.storage.from("files").getPublicUrl(`listings/${file.name}`).data
          .publicUrl,
      }));

      const listingWithImages = {
        ...listingData,
        images,
      };

      ctx.response.status = 200;
      ctx.response.body = { listing: listingWithImages };
    } catch (error) {
      console.error("Failed to fetch listing:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to fetch listing" };
    }
  }

  async getListingsByUser(ctx: RouterContext<"/api/listings/user/:username">) {
    try {
      const username = ctx.params.username;

      const { data: listings, error: listingsError } = await db
        .from("listings")
        .select("*, seller:users!inner(username, avatar_url)")
        .eq("seller.username", username);

      if (listingsError || !listings) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Listings not found" };
        return;
      }

      const listingsWithImages = await Promise.all(
        // @ts-ignore: type
        listings.map(async (listing) => {
          try {
            // List all files in the bucket for this listing
            const { data: searchFiles, error: filesError } = await db.storage
              .from("files")
              .list("listings", {
                offset: 0,
                search: `${listing.listing_id}_`,
                sortBy: { column: "name", order: "asc" },
              });

            if (filesError) {
              ctx.response.status = 500;
              ctx.response.body = { message: "Failed to fetch listing images" };
              return;
            }

            const files = searchFiles?.filter((file) =>
              file.name.startsWith(`${listing.listing_id}_`),
            );

            // Generate full URLs for the images
            const images = files.map((file) => ({
              filename: file.name,
              url: db.storage
                .from("files")
                .getPublicUrl(`listings/${file.name}`).data.publicUrl,
            }));

            return {
              ...listing,
              images: images,
            };
          } catch (error) {
            console.error(
              `Error processing images for listing_id=${listing.listing_id}:`,
              error,
            );
            return {
              ...listing,
              images: [],
            };
          }
        }),
      );

      ctx.response.status = 200;
      ctx.response.body = { listings: listingsWithImages };
    } catch (error) {
      console.error("Failed to fetch listings by user:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to fetch listings by user" };
    }
  }

  async searchListings(ctx: Context) {
    try {
      const query = ctx.request.url.searchParams.get("query") || "";

      const { data: listings, error: listingsError } = await db
        .from("listings")
        .select("*, seller:users(username, avatar_url)")
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`);

      if (listingsError) throw listingsError;

      const listingsWithImages = await Promise.all(
        // @ts-ignore: type
        listings.map(async (listing) => {
          try {
            // List all files in the bucket for this listing
            const { data: searchFiles, error: filesError } = await db.storage
              .from("files")
              .list("listings", {
                offset: 0,
                search: `${listing.listing_id}_`,
                sortBy: { column: "name", order: "asc" },
              });

            if (filesError) {
              ctx.response.status = 500;
              ctx.response.body = { message: "Failed to fetch listing images" };
              return;
            }

            const files = searchFiles?.filter((file) =>
              file.name.startsWith(`${listing.listing_id}_`),
            );

            // Generate full URLs for the images
            const images = files.map((file) => ({
              filename: file.name,
              url: db.storage
                .from("files")
                .getPublicUrl(`listings/${file.name}`).data.publicUrl,
            }));

            return {
              ...listing,
              images: images,
            };
          } catch (error) {
            console.error(
              `Error processing images for listing_id=${listing.listing_id}:`,
              error,
            );
            return {
              ...listing,
              images: [],
            };
          }
        }),
      );

      ctx.response.status = 200;
      ctx.response.body = { listings: listingsWithImages };
    } catch (error) {
      console.error("Failed to search listings:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to search listings" };
    }
  }

  async deleteListing(ctx: RouterContext<"/api/listings/:id">) {
    try {
      const id = ctx.params.id;

      const [listingResult, followersResult] = await Promise.all([
        db.from("listings").select("title").eq("listing_id", id).single(),
        db.from("listing_follows").select("user_id").eq("listing_id", id),
      ]);

      if (listingResult.error) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Listing not found" };
        return;
      }

      const title = listingResult.data.title;

      if (followersResult.data) {
        await Promise.all(
          followersResult.data.map((follower) =>
            sendNotification(
              follower.user_id,
              `The listing "${title}" has been deleted.`,
              "",
              "deleted",
            ),
          ),
        );
      }

      const { data: searchFiles, error: listFilesError } = await db.storage
      .from("files")
      .list(`listings`, { offset: 0, search: `${id}_` });

    if (listFilesError) {
      console.error(
        "Failed to list files in listings folder:",
        listFilesError,
      );
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to fetch associated files" };
      return;
    }

    const files = searchFiles?.filter((file) =>
      file.name.startsWith(`${id}_`),
    );

    if (!files || files.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "No files found for this listing" };
      return;
    }

    const filePaths = files.map((file) => `listings/${file.name}`);
    const { error: deleteFilesError } = await db.storage
      .from("files")
      .remove(filePaths);

    if (deleteFilesError) {
      console.error("Failed to delete files from storage:", deleteFilesError);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to delete files from storage" };
      return;
    }

    console.log("Files deleted successfully:", filePaths);


      const { data, error } = await db
        .from("listings")
        .delete()
        .eq("listing_id", id);

      if (error) {
        console.error("Failed to delete listing:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to delete listing" };
        return;
      }

      if (!data) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Listing not found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Listing deleted successfully" };
    } catch (error) {
      console.error("Failed to delete listing:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to delete listing" };
    }
  }

  async updateListing(ctx: RouterContext<"/api/listings/:id">) {
    try {
      const id = ctx.params.id;
      const formData = await ctx.request.body.formData();

      // Extract form fields
      const title = formData.get("title") as string;
      const price = parseFloat(formData.get("price") as string);
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;
      const productImages = formData.getAll("files") as File[];
      const existingImages = formData.getAll("existingImages") as string[];

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

      const { data: listingData, error: listingError } = await db
        .from("listings")
        .select("user_id")
        .eq("listing_id", id)
        .single();

      const [listingResult, followersResult] = await Promise.all([
        db.from("listings").select("title").eq("listing_id", id).single(),
        db.from("listing_follows").select("user_id").eq("listing_id", id),
      ]);

      if (listingError || !listingData || !listingResult.data) {
        console.error("Listing not found:", listingError);
        ctx.response.status = 404;
        ctx.response.body = { message: "Listing not found" };
        return;
      }

      if (listingData.user_id !== ucid) {
        ctx.response.status = 403;
        ctx.response.body = {
          message: "You are not authorized to edit this listing",
        };
        return;
      }

      const { error: updateError } = await db
        .from("listings")
        .update({
          title,
          price,
          description,
          category,
        })
        .eq("listing_id", id);

      if (updateError) {
        console.error("Update Error:", updateError);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to update listing details" };
        return;
      }

      const { data: searchFiles, error: filesError } = await db.storage
        .from("files")
        .list("listings", {
          offset: 0,
          search: `${id}_`,
          sortBy: { column: "name", order: "asc" },
        });

      if (filesError) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to fetch listing images" };
        return;
      }

      const files = searchFiles?.filter((file) =>
        file.name.startsWith(`${id}_`),
      );

      const filesToKeep =
        files?.filter((file) =>
          existingImages.some((url) => url.includes(file.name)),
        ) || [];

      if (files) {
        const filesToRemove = files.filter(
          (file) =>
            !filesToKeep.some((keepFile) => keepFile.name === file.name),
        );

        if (filesToRemove.length > 0) {
          await db.storage
            .from("files")
            .remove(filesToRemove.map((file) => `listings/${file.name}`));
        }

        for (let i = 0; i < filesToKeep.length; i++) {
          const oldName = filesToKeep[i].name;
          const newPath = `listings/${id}_${String(i + 1).padStart(2, "0")}_${oldName.split("_").slice(2).join("_")}`;
          const oldPath = `listings/${oldName}`;

          if (oldPath === newPath) continue;

          console.log(oldPath);
          console.log(newPath);

          try {
            const { error: copyError } = await db.storage
              .from("files")
              .copy(oldPath, newPath);

            if (copyError) throw copyError;

            const { error: deleteError } = await db.storage
              .from("files")
              .remove([oldPath]);

            if (deleteError) throw deleteError;
          } catch (error) {
            ctx.response.status = 500;
            ctx.response.body = { message: `Error updating images: ${error}` };
            return;
          }
        }
      }

      if (productImages) {
        for (const [index, image] of productImages.entries()) {
          const content = await image.arrayBuffer();
          const name = image.name
            .replace(/ /g, "_")
            .replace(/[^a-zA-Z0-9._-]/g, "")
            .toLowerCase();

          const paddedIndex = String(filesToKeep.length + index + 1).padStart(
            2,
            "0",
          );
          const filePath = `listings/${id}_${paddedIndex}_${name}`;

          const { error: uploadError } = await db.storage
            .from("files")
            .upload(filePath, content, {
              contentType: image.type,
            });

          if (uploadError) {
            console.error("Upload Error:", uploadError);
            ctx.response.status = 500;
            ctx.response.body = {
              message: `Failed to upload image: ${uploadError.message}`,
            };
            return;
          }
        }
      }

      if (followersResult.data) {
        await Promise.all(
          followersResult.data.map((follower) =>
            sendNotification(
              follower.user_id,
              `The listing "${title}" has been updated by the seller.`,
              `/listings/${id}`,
              "edited",
            ),
          ),
        );
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Listing updated successfully" };
    } catch (error) {
      console.error("Failed to update listing:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to update listing" };
    }
  }

  async getFollowListing(ctx: RouterContext<"/api/listings/:id/follow">) {
    try {
      const id = ctx.params.id;
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

      const { data } = await db
        .from("listing_follows")
        .select("*")
        .eq("user_id", ucid)
        .eq("listing_id", id)
        .single();

      ctx.response.status = 200;
      ctx.response.body = { follow: !!data };
    } catch (error) {
      console.error("Failed to follow listing:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to follow listing" };
    }
  }

  async followListing(ctx: RouterContext<"/api/listings/:id/follow">) {
    try {
      const id = ctx.params.id;
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

      const { error } = await db.from("listing_follows").insert({
        user_id: ucid,
        listing_id: id,
      });

      if (error) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Error insterting into table" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "success" };
    } catch (error) {
      console.error("Failed to follow listing:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to follow listing" };
    }
  }

  async removeFollowListing(ctx: RouterContext<"/api/listings/:id/follow">) {
    try {
      const id = ctx.params.id;
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

      const { error } = await db
        .from("listing_follows")
        .delete()
        .eq("user_id", ucid)
        .eq("listing_id", id);

      if (error) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Error deleting from table" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "success" };
    } catch (error) {
      console.error("Failed to follow listing:", error);
      ctx.response.status = 500;
      ctx.response.body = { message: "Failed to follow listing" };
    }
  }
}

async function sendNotification(
  userId: string,
  message: string,
  link: string,
  type: string,
) {
  try {
    const response = await db.from("notifications").insert({
      user_id: userId,
      message: message,
      type,
      link,
    });

    if (response.error) {
      console.error("Error sending notification:", response.error.message);
      throw new Error("Failed to send notification");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sending notification:", error);
    return { success: false, error };
  }
}
