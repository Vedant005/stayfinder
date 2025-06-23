import React, { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore"; // Adjust path
import { useNavigate } from "react-router-dom"; // Assuming you use react-router-dom

const LoginForm: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, setLoading, setError, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await axios.post("/api/v1/auth/login", {
        username: usernameOrEmail, // Or email, depending on what your backend expects for login
        email: usernameOrEmail,
        password,
      });

      // Assuming your backend returns user data, accessToken, and refreshToken
      const { user, accessToken, refreshToken } = response.data.data;
      login(user, accessToken, refreshToken);
      navigate("/"); // Redirect to homepage or dashboard
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-center">Login</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Username or Email:
        </label>
        <input
          type="text"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
