import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore"; // Adjust path

// Create a custom Axios instance
const axiosInstance = axios.create({
  baseURL: "/api/v1", // Your backend API base URL
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies (like your refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: ((tokenOrError: string | Error) => void)[] = [];

// Function to process the queue of failed requests once a new token is available
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom(error);
    } else if (token) {
      prom(token);
    }
  });
  failedQueue = []; // Clear the queue
};

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { logout, accessToken, refreshToken } = useAuthStore.getState();

    // Check if the error is 401 Unauthorized AND it's not the refresh token endpoint itself
    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      // If no refresh token or no access token, or user is already logging out, just log out
      if (!refreshToken || !accessToken) {
        logout(); // Clear any partial state and redirect
        // Optionally, redirect to login page if not already there
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login"; // Or use react-router-dom's navigate
        }
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue the original request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push((token) => {
            if (token instanceof Error) {
              return reject(token); // If refresh failed
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest)); // Retry the original request with new token
          });
        });
      }

      isRefreshing = true; // Mark refresh as in progress

      try {
        const response = await axios.post(
          "/api/v1/auth/refresh-token",
          {},
          {
            withCredentials: true, // Ensure cookies are sent
          }
        );

        // Assuming your refresh-token endpoint returns new accessToken and refreshToken in `response.data.data`
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update the store with new tokens
        useAuthStore
          .getState()
          .login(
            useAuthStore.getState().user!,
            newAccessToken,
            newRefreshToken
          ); // Re-login updates all auth state

        isRefreshing = false;
        processQueue(null, newAccessToken); // Process all queued requests with the new access token

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest); // Retry the original failed request
      } catch (refreshError: any) {
        isRefreshing = false;
        processQueue(refreshError, null); // Inform queued requests about the failure

        logout(); // Refresh failed, so log out the user
        // Redirect to login page
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login"; // Or use react-router-dom's navigate
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // For any other errors, just re-throw
  }
);

export default axiosInstance;
