import { Router } from "@oak/oak";
import { ListingsController } from "../controllers/listings.controller.ts";

export const router = new Router();
const listingController = new ListingsController();

router
  .get("/api/listings", listingController.getListings)
  .get("/api/listings/user/:username", listingController.getListingsByUser)
  .get("/api/listings/:id", listingController.getListing)
  .put("/api/listings/:id", listingController.updateListing)
  .delete("/api/listings/:id", listingController.deleteListing)
  .get("/api/search", listingController.searchListings)
  .get("/api/listings/:id/follow", listingController.getFollowListing)
  .post("/api/listings/:id/follow", listingController.followListing)
  .delete("/api/listings/:id/follow", listingController.removeFollowListing);
