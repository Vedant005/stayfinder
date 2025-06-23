import { create } from "zustand";
import axiosInstance from "../utils/axiosInterceptors";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "guest" | "host" | "admin";
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  host: User; // Populated User object
  createdAt: string; // Add these if your schema includes them
  updatedAt: string;
}
// stores/useListingStore.ts

// Define the state for your listing store
interface ListingState {
  listings: Listing[];
  selectedListing: Listing | null;
  loading: boolean;
  error: string | null;
}

// Define the actions/methods for your listing store
interface ListingActions {
  fetchListings: () => Promise<void>;
  fetchListingById: (id: string) => Promise<void>;
  addListing: (newListing: Listing) => void;
  updateListing: (updatedListing: Listing) => void;
  removeListing: (listingId: string) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Combine state and actions
type ListingStore = ListingState & ListingActions;

export const useListingStore = create<ListingStore>()((set) => ({
  // Initial state
  listings: [],
  selectedListing: null,
  loading: false,
  error: null,

  // Actions
  fetchListings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/listings");
      // Assuming your API response structure is { success: true, data: [...], message: "..." }
      if (response.data.success) {
        set({ listings: response.data.data, loading: false });
      } else {
        set({
          error: response.data.message || "Failed to fetch listings",
          loading: false,
        });
      }
    } catch (err: any) {
      console.error("Error fetching listings:", err);
      set({
        error: err.response?.data?.message || "Error fetching listings.",
        loading: false,
      });
    }
  },

  fetchListingById: async (id: string) => {
    set({ loading: true, error: null, selectedListing: null });
    try {
      const response = await axiosInstance.get(`/listings/${id}`);
      if (response.data.success) {
        set({ selectedListing: response.data.data, loading: false });
      } else {
        set({
          error: response.data.message || "Failed to fetch listing",
          loading: false,
        });
      }
    } catch (err: any) {
      console.error(`Error fetching listing with ID ${id}:`, err);
      set({
        error:
          err.response?.data?.message || `Listing with ID ${id} not found.`,
        loading: false,
      });
    }
  },

  addListing: (newListing) => {
    set((state) => ({
      listings: [newListing, ...state.listings], // Add to the beginning for immediate display
    }));
  },

  updateListing: (updatedListing) => {
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing._id === updatedListing._id ? updatedListing : listing
      ),
      selectedListing:
        state.selectedListing?._id === updatedListing._id
          ? updatedListing
          : state.selectedListing,
    }));
  },

  removeListing: (listingId) => {
    set((state) => ({
      listings: state.listings.filter((listing) => listing._id !== listingId),
      selectedListing:
        state.selectedListing?._id === listingId ? null : state.selectedListing,
    }));
  },

  clearError: () => set({ error: null }),
  setLoading: (isLoading) => set({ loading: isLoading }),
}));
