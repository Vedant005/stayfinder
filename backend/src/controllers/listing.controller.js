import { Listing } from "../models/listing.js";
import { User } from "../models/user.js"; // To populate host details
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createListing = asyncHandler(async (req, res) => {
  const { title, description, price, location } = req.body;
  const imageFiles = req.files;

  // Basic validation for text fields
  if (!title || !description || !price || !location) {
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err)
            console.error(
              "Error deleting temp file on validation fail:",
              err.message
            );
        });
      });
    }
    throw new ApiError(
      400,
      "Title, description, price, and location are required."
    );
  }

  if (!imageFiles || imageFiles.length === 0) {
    throw new ApiError(400, "At least one image is required for the listing.");
  }

  const hostId = req.user._id;
  const imageUrls = [];

  // Upload each image to Cloudinary
  for (const file of imageFiles) {
    const cloudinaryResponse = await uploadOnCloudinary(file.path);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      imageUrls.push(cloudinaryResponse.url);
    } else {
      console.error(`Failed to upload ${file.filename} to Cloudinary.`);

      throw new ApiError(500, "Failed to upload one or more images.");
    }
  }

  if (imageUrls.length === 0) {
    throw new ApiError(500, "No images could be uploaded to Cloudinary.");
  }

  const listing = await Listing.create({
    title,
    description,
    price,
    location,
    images: imageUrls,
    host: hostId,
  });

  if (!listing) {
    throw new ApiError(500, "Something went wrong while creating the listing.");
  }

  const createdListing = await Listing.findById(listing._id).populate(
    "host",
    "username email"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdListing, "Listing created successfully.")
    );
});

const getAllListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find().populate("host", "username email"); // Populate host details

  if (!listings || listings.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No listings found."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, listings, "Listings fetched successfully."));
});

const getListingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID format.");
  }

  const listing = await Listing.findById(id).populate("host", "username email"); // Populate host details

  if (!listing) {
    throw new ApiError(404, "Listing not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Listing fetched successfully."));
});

const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, price, location, images } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID format.");
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found.");
  }

  if (listing.host.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this listing.");
  }

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    {
      $set: {
        title,
        description,
        price,
        location,
        images,
      },
    },
    { new: true, runValidators: true }
  ).populate("host", "username email");

  if (!updatedListing) {
    throw new ApiError(500, "Something went wrong while updating the listing.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedListing, "Listing updated successfully.")
    );
});

// Controller for deleting a listing (Host Only, and must own the listing)
const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID format.");
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found.");
  }

  if (listing.host.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this listing.");
  }

  await Listing.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Listing deleted successfully."));
});

export {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
};
