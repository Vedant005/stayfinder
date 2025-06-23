import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import axios from "axios";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call your backend logout endpoint
      await axios.post(
        "/api/v1/auth/logout",
        {},
        {
          withCredentials: true, // If your backend uses HttpOnly cookies
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`, // Send token if needed
          },
        }
      );
      logout(); // Clear Zustand state and local storage
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if backend logout fails, clear frontend state for user experience
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Property App
        </Link>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {user?.username} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
