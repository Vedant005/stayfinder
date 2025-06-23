import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  images: [String],
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
export const Listing = mongoose.model("Listing", listingSchema);
