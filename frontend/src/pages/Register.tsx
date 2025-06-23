import React, { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"guest" | "host">("guest"); // Default to guest

  const { setLoading, setError, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/v1/auth/register", {
        username,
        email,
        password,
        role, // Send the selected role
      });
      // Optionally, automatically log in the user after successful registration
      // const loginResponse = await axios.post('/api/v1/auth/login', { email, password });
      // const { user, accessToken, refreshToken } = loginResponse.data.data;
      // useAuthStore.getState().login(user, accessToken, refreshToken);

      navigate("/login"); // Redirect to login page after successful registration
      alert("Registration successful! Please log in."); // Use a custom modal instead of alert in production
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
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
      <h2 className="text-2xl font-bold text-center">Register</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Username:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      {/* Role selection for registration - consider if you want guests to pick 'host' directly */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Register as:
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "guest" | "host")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="guest">Guest</option>
          <option value="host">Host</option>
          {/* Admin role typically not selectable during registration */}
        </select>
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
