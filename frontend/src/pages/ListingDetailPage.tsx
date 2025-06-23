import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListingStore } from "../stores/useListingStore";
import { useBookingStore } from "../stores/useBookingStore";
import { useAuthStore } from "../stores/useAuthStore"; // To get user ID for booking
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    selectedListing,
    loading: listingLoading,
    error: listingError,
    fetchListingById,
  } = useListingStore();
  const {
    createBooking,
    loading: bookingLoading,
    error: bookingError,
    clearError: clearBookingError,
  } = useBookingStore();
  const { isAuthenticated, user } = useAuthStore();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchListingById(id);
    }
  }, [id, fetchListingById]);

  useEffect(() => {
    // Calculate total price whenever dates or listing price changes
    if (startDate && endDate && selectedListing) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalPrice(diffDays * selectedListing.price);
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, selectedListing]);

  const handleBooking = async () => {
    clearBookingError();
    setBookingMessage(null);

    if (!isAuthenticated) {
      setBookingMessage("Please log in to book this property.");
      navigate("/login");
      return;
    }
    if (user?.role !== "guest") {
      setBookingMessage("Only guests can book properties.");
      return;
    }
    if (!selectedListing) {
      setBookingMessage("Listing details not loaded.");
      return;
    }
    if (!startDate || !endDate) {
      setBookingMessage("Please select both start and end dates.");
      return;
    }

    try {
      const newBooking = await createBooking(
        selectedListing._id,
        startDate.toISOString(), // Send as ISO string
        endDate.toISOString(), // Send as ISO string
        totalPrice
      );
      if (newBooking) {
        setBookingMessage(
          "Booking successfully created! Status: Pending confirmation."
        );
        setStartDate(null);
        setEndDate(null);
        setTotalPrice(0);
      }
    } catch (error: any) {
      setBookingMessage(error.message || "Failed to create booking.");
    }
  };

  if (listingLoading) {
    return <div className="text-center p-4">Loading listing details...</div>;
  }

  if (listingError) {
    return (
      <div className="text-center p-4 text-red-500">Error: {listingError}</div>
    );
  }

  if (!selectedListing) {
    return (
      <div className="text-center p-4 text-gray-600">Listing not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl my-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        {selectedListing.title}
      </h1>
      <p className="text-gray-700 text-lg mb-6">{selectedListing.location}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {selectedListing.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${selectedListing.title} image ${index + 1}`}
            className="w-full h-64 object-cover rounded-lg shadow-sm"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/640x480/cccccc/333333?text=Image+Error";
            }}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            {selectedListing.description}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">Pricing</h2>
          <p className="text-3xl font-extrabold text-indigo-700 mb-6">
            ${selectedListing.price} / night
          </p>

          <p className="text-gray-600">
            Hosted by:{" "}
            <span className="font-semibold">
              {selectedListing.host.username}
            </span>{" "}
            ({selectedListing.host.email})
          </p>
        </div>

        <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Book Your Stay
          </h2>
          {bookingMessage && (
            <p
              className={`mb-4 text-center ${
                bookingError ? "text-red-500" : "text-green-600"
              }`}
            >
              {bookingMessage}
            </p>
          )}
          {bookingError && (
            <p className="mb-4 text-center text-red-500">
              Booking Error: {bookingError}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="MM/dd/yyyy"
              placeholderText="Select start date"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()} // End date cannot be before start date
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="MM/dd/yyyy"
              placeholderText="Select end date"
            />
          </div>

          <div className="text-xl font-bold text-center text-gray-900 mb-6">
            Total: ${totalPrice.toFixed(2)}
          </div>

          <button
            onClick={handleBooking}
            disabled={
              bookingLoading ||
              !startDate ||
              !endDate ||
              totalPrice <= 0 ||
              !isAuthenticated ||
              user?.role !== "guest"
            }
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading ? "Processing Booking..." : "Confirm Booking"}
          </button>

          {!isAuthenticated && (
            <p className="text-center text-sm text-gray-500 mt-3">
              You must be logged in to book.
            </p>
          )}
          {user?.role !== "guest" && isAuthenticated && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Only guests can book properties. Your role is {user?.role}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
