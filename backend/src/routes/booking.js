import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/booking.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, authorizeRoles("guest"), createBooking);

// Route to get all bookings (Admin can see all, Guest sees their own, Host sees for their listings)
router
  .route("/")
  .get(verifyJWT, authorizeRoles("guest", "host", "admin"), getAllBookings);

// Routes for specific booking by ID
router
  .route("/:id")
  .get(verifyJWT, authorizeRoles("guest", "host", "admin"), getBookingById)
  .put(verifyJWT, authorizeRoles("guest", "host", "admin"), updateBookingStatus) // Guest can cancel, Host can confirm/cancel, Admin can change any
  .delete(verifyJWT, authorizeRoles("guest", "host", "admin"), deleteBooking); // Guest/Host can delete pending, Admin can delete any

export default router;
