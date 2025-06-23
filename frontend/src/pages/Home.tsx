import React, { useEffect } from "react";
import { useListingStore } from "../stores/useListingStore"; // Adjust path
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const { listings, loading, error, fetchListings } = useListingStore();

  useEffect(() => {
    fetchListings(); // Fetch listings when the component mounts
  }, [fetchListings]); // Dependency array: re-run if fetchListings function changes (unlikely for a Zustand action)

  if (loading) {
    return <div className="text-center p-4">Loading listings...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Available Properties
      </h1>
      {listings.length === 0 ? (
        <p className="text-center text-gray-600">
          No properties available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={
                  listing.images[0] ||
                  "https://placehold.co/400x250/cccccc/333333?text=No+Image"
                }
                alt={listing.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/400x250/cccccc/333333?text=Image+Error";
                }}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                <p className="text-gray-600 mb-2">{listing.location}</p>
                <p className="text-lg font-bold text-indigo-700 mb-4">
                  ${listing.price} / night
                </p>
                <Link
                  to={`/listings/${listing._id}`}
                  className="block w-full text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
