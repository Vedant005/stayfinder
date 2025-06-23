// routes/listing.routes.js

import { Router } from "express";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js"; // Adjust path if auth.js is directly in middlewares
import { upload } from "../middlewares/multer.middleware.js"; // Adjust path to your multer config

const router = Router();

// Public routes (anyone can view listings)
router.route("/").get(getAllListings);
router.route("/:id").get(getListingById);

// Protected routes (Host only)
router.route("/").post(
  verifyJWT,
  authorizeRoles("host"),
  upload.array("images", 10), // 'images' is the field name from your form, 10 is max files
  createListing
);

router
  .route("/:id")
  .put(
    verifyJWT,
    authorizeRoles("host"),
    upload.array("newImages", 5), // 'newImages' for new files during update. Max 5 new images.
    updateListing
  )
  .delete(verifyJWT, authorizeRoles("host"), deleteListing);

export default router;
