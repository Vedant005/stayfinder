import { Router } from "express";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.js";

const router = Router();

router.route("/").get(getAllListings);
router.route("/:id").get(getListingById);

// Protected routes (Host only)
router.route("/").post(verifyJWT, authorizeRoles("host"), createListing);
router
  .route("/:id")
  .put(verifyJWT, authorizeRoles("host"), updateListing)
  .delete(verifyJWT, authorizeRoles("host"), deleteListing);

export default router;
