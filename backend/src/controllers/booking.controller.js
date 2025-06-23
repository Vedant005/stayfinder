import mongoose from "mongoose";
import { Booking } from "../models/booking.js";
import { Listing } from "../models/listing.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper function to calculate number of nights
const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Controller for creating a new booking (Guest Only)
const createBooking = asyncHandler(async (req, res) => {
  const { listingId, startDate, endDate } = req.body;

  if (!listingId || !startDate || !endDate) {
    throw new ApiError(
      400,
      "Listing ID, start date, and end date are required."
    );
  }

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new ApiError(400, "Invalid listing ID format.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (start >= end) {
    throw new ApiError(400, "End date must be after start date.");
  }
  if (start < now) {
    throw new ApiError(400, "Start date cannot be in the past.");
  }

  const guestId = req.user._id;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found.");
  }

  if (listing.host.toString() === guestId.toString()) {
    throw new ApiError(403, "You cannot book your own listing.");
  }

  const conflictingBookings = await Booking.find({
    listing: listingId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      // Case 1: Existing booking starts within the new booking period
      { startDate: { $lt: end }, endDate: { $gt: start } },
    ],
  });

  if (conflictingBookings.length > 0) {
    throw new ApiError(
      409,
      "The selected dates overlap with an existing booking for this listing."
    );
  }

  const numberOfNights = calculateNights(start, end);
  const totalPrice = numberOfNights * listing.price;

  const booking = await Booking.create({
    listing: listingId,
    guest: guestId,
    startDate: start,
    endDate: end,
    totalPrice,
    status: "pending",
  });

  if (!booking) {
    throw new ApiError(500, "Something went wrong while creating the booking.");
  }

  const createdBooking = await Booking.findById(booking._id)
    .populate("listing", "title location price images")
    .populate("guest", "username email");

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdBooking, "Booking created successfully.")
    );
});

// Controller for getting all bookings (Admin/User-specific)
const getAllBookings = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  let query = {};

  if (role === "guest") {
    query.guest = userId;
  } else if (role === "host") {
    // Find all listings owned by this host
    const hostListings = await Listing.find({ host: userId }).select("_id");
    const listingIds = hostListings.map((listing) => listing._id);
    if (listingIds.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No bookings found for your listings."));
    }
    query.listing = { $in: listingIds };
  }

  const bookings = await Booking.find(query)
    .populate("listing", "title location price images host")
    .populate("guest", "username email");

  if (!bookings || bookings.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No bookings found."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings fetched successfully."));
});

// Controller for getting a single booking by ID (Accessible by guest, host, admin)
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid booking ID format.");
  }

  const booking = await Booking.findById(id)
    .populate("listing", "title location price images host")
    .populate("guest", "username email");

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const { role, _id: userId } = req.user;

  const isGuest = booking.guest._id.toString() === userId.toString();
  const isHost = booking.listing.host.toString() === userId.toString();
  const isAdmin = role === "admin";

  if (!isGuest && !isHost && !isAdmin) {
    throw new ApiError(403, "You are not authorized to view this booking.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking fetched successfully."));
});

// Controller for updating booking status (Host/Guest/Admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // New status: 'confirmed', 'cancelled'

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid booking ID format.");
  }

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    throw new ApiError(
      400,
      "Invalid status provided. Must be 'pending', 'confirmed', or 'cancelled'."
    );
  }

  const booking = await Booking.findById(id).populate("listing", "host");

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const { role, _id: userId } = req.user;
  const isGuest = booking.guest.toString() === userId.toString();
  const isHost = booking.listing.host.toString() === userId.toString();
  const isAdmin = role === "admin";

  if (isAdmin) {
  } else if (isHost) {
    if (booking.status === "confirmed" && status === "pending") {
      throw new ApiError(
        403,
        "Host cannot revert a confirmed booking to pending."
      );
    }
    if (status === "pending") {
      throw new ApiError(
        403,
        "Host cannot set booking status to pending, only confirm or cancel."
      );
    }
  } else if (isGuest) {
    if (status !== "cancelled" || booking.status !== "pending") {
      throw new ApiError(403, "Guests can only cancel their pending bookings.");
    }
  } else {
    throw new ApiError(
      403,
      "You are not authorized to update this booking status."
    );
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("listing", "title location price images")
    .populate("guest", "username email");

  if (!updatedBooking) {
    throw new ApiError(
      500,
      "Something went wrong while updating the booking status."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedBooking,
        `Booking status updated to ${status}.`
      )
    );
});

// Controller for deleting/cancelling a booking (Guest/Host/Admin)
const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid booking ID format.");
  }

  const booking = await Booking.findById(id).populate("listing", "host");

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const { role, _id: userId } = req.user;
  const isGuest = booking.guest.toString() === userId.toString();
  const isHost = booking.listing.host.toString() === userId.toString();
  const isAdmin = role === "admin";

  // Authorization check
  if (!isAdmin && !isGuest && !isHost) {
    throw new ApiError(403, "You are not authorized to delete this booking.");
  }

  // Guests/Hosts can only delete if it's pending. Admins can delete any.
  if (!isAdmin && booking.status !== "pending") {
    throw new ApiError(
      403,
      "Only pending bookings can be deleted by guests/hosts. Please contact support to cancel a confirmed booking."
    );
  }

  await Booking.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Booking deleted successfully."));
});

export {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};
