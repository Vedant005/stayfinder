import { create } from "zustand";
import axiosInstance from "../utils/axiosInterceptors";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "guest" | "host" | "admin";
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  host: User; // Populated User object
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  listing: Listing; // Populated Listing object
  guest: User; // Populated User object
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
// Define the state for your booking store
interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

// Define the actions/methods for your booking store
interface BookingActions {
  fetchBookings: () => Promise<void>;
  createBooking: (
    listingId: string,
    startDate: string,
    endDate: string,
    totalPrice: number
  ) => Promise<Booking | null>;
  updateBookingStatus: (
    bookingId: string,
    newStatus: Booking["status"]
  ) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Combine state and actions
type BookingStore = BookingState & BookingActions;

export const useBookingStore = create<BookingStore>()((set) => ({
  // Initial state
  bookings: [],
  loading: false,
  error: null,

  // Actions
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/bookings"); // Backend handles role-based filtering
      if (response.data.success) {
        set({ bookings: response.data.data, loading: false });
      } else {
        set({
          error: response.data.message || "Failed to fetch bookings",
          loading: false,
        });
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      set({
        error: err.response?.data?.message || "Error fetching bookings.",
        loading: false,
      });
    }
  },

  createBooking: async (listingId, startDate, endDate, totalPrice) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/bookings", {
        listingId,
        startDate,
        endDate,
        totalPrice,
      });
      if (response.data.success) {
        const newBooking: Booking = response.data.data;
        set((state) => ({
          bookings: [newBooking, ...state.bookings], // Add to the list
          loading: false,
          error: null,
        }));
        return newBooking;
      } else {
        set({
          error: response.data.message || "Failed to create booking",
          loading: false,
        });
        return null;
      }
    } catch (err: any) {
      console.error("Error creating booking:", err);
      set({
        error: err.response?.data?.message || "Error creating booking.",
        loading: false,
      });
      return null;
    }
  },

  updateBookingStatus: async (bookingId, newStatus) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/bookings/${bookingId}`, {
        status: newStatus,
      });
      if (response.data.success) {
        const updatedBooking: Booking = response.data.data;
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking._id === updatedBooking._id ? updatedBooking : booking
          ),
          loading: false,
          error: null,
        }));
      } else {
        set({
          error: response.data.message || "Failed to update booking status",
          loading: false,
        });
      }
    } catch (err: any) {
      console.error(
        `Error updating booking ${bookingId} status to ${newStatus}:`,
        err
      );
      set({
        error: err.response?.data?.message || "Error updating booking status.",
        loading: false,
      });
    }
  },

  deleteBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/bookings/${bookingId}`);
      if (response.data.success) {
        set((state) => ({
          bookings: state.bookings.filter(
            (booking) => booking._id !== bookingId
          ),
          loading: false,
          error: null,
        }));
      } else {
        set({
          error: response.data.message || "Failed to delete booking",
          loading: false,
        });
      }
    } catch (err: any) {
      console.error(`Error deleting booking with ID ${bookingId}:`, err);
      set({
        error: err.response?.data?.message || "Error deleting booking.",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (isLoading) => set({ loading: isLoading }),
}));
