# StayFinder: Modern Property Rental Platform

## 🏡 Project Overview

StayFinder is a full-stack web application designed to simplify property rentals, inspired by leading platforms like Airbnb. It connects property owners (hosts) with prospective renters (guests), offering features for listing management, secure booking, and robust user authentication with role-based access control.

This project is built with a modern MERN (MongoDB, Express.js, React, Node.js) stack, emphasizing clean architecture, secure practices, and a scalable design.

## ✨ Features

### User Management & Authentication:

- **Secure User Registration:** Guests and Hosts can create accounts.
- **User Login/Logout:** Secure authentication using JWTs and HttpOnly cookies.
- **Token Refresh Mechanism:** Seamless session management with Axios interceptors for automatic token refresh.
- **Role-Based Access Control (RBAC):** Distinct permissions for `guest`, `host`, and `admin` roles, ensuring secure access to functionalities.

### Property Listing Management (for Hosts):

- **Create Listings:** Hosts can add new properties with titles, descriptions, pricing, location, and multiple images.
- **Image Uploads:** Integrated with Cloudinary for efficient and scalable image storage.
- **View/Manage Own Listings:** Hosts can view and edit their own property listings.
- **Update Listings:** Modify existing listing details and images.
- **Delete Listings:** Remove properties from the platform.

### Property Browse (for Guests & Public):

- **Browse All Listings:** Guests and public users can view all available properties.
- **Detailed Listing View:** Access comprehensive information about each property, including descriptions, images, pricing, and host details.

### Booking System (for Guests):

- **Create Bookings:** Guests can reserve properties for specific date ranges.
- **Conflict Detection:** Robust logic to prevent overlapping bookings for the same property.
- **View My Bookings:** Guests can track their own reservations.
- **Cancel Bookings:** Guests can cancel their `pending` bookings.

### Booking Management (for Hosts):

- **View Bookings for My Listings:** Hosts can see all bookings made for their properties.
- **Update Booking Status:** Hosts can confirm or cancel `pending` bookings.

## 🛠️ Tech Stack

**Frontend:**

- **React:** A declarative, component-based JavaScript library for building user interfaces.
- **TypeScript:** A superset of JavaScript that adds static types, enhancing code quality and maintainability.
- **Zustand:** A fast and lightweight state management solution for React.
- **Axios:** A promise-based HTTP client for making API requests, configured with interceptors for authentication.
- **React Router DOM:** For declarative routing in the React application.
- **React Datepicker:** A flexible and customizable date picker component.
- **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

**Backend:**

- **Node.js:** A JavaScript runtime environment.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB:** A NoSQL document database for storing application data.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (JSON Web Tokens):** For secure and stateless user authentication.
- **Bcrypt:** For secure password hashing.
- **Cloudinary:** Cloud-based image and video management service for storing listing images.
- **Multer:** Node.js middleware for handling `multipart/form-data`, used for file uploads.
- **Cookie-parser:** Middleware to parse cookie headers.
- **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
- **Dotenv:** For managing environment variables.
- **Nodemon:** A utility that monitors for changes in your Node.js application and automatically restarts the server.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js) or **Yarn**
- **MongoDB** (local instance or a cloud-hosted one like MongoDB Atlas)
- **Cloudinary Account:** For image storage.

### Backend Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd propert-ease/backend # Adjust this path if your project structure is different
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create a `.env` file:**
    In the `backend` root directory, create a file named `.env` and populate it with your environment variables (see [Environment Variables](#environment-variables) section below).

4.  **Start the backend server:**
    ```bash
    npm run dev # or npm start if you prefer
    ```
    The backend server should start on the port specified in your `.env` file (e.g., `http://localhost:8000`).

### Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd ../frontend # Assuming you are in the backend directory
    # or cd propert-ease/frontend if starting from root
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create a `.env` file:**
    In the `frontend` root directory, create a file named `.env` and populate it with your environment variables (see [Environment Variables](#environment-variables) section below).

4.  **Start the frontend development server:**
    ```bash
    npm run dev # or npm start
    ```
    The frontend application should open in your browser (e.g., `http://localhost:5173` or `http://localhost:3000`).

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/StayFinderDB
CORS_ORIGIN=http://localhost:5173 # Or your frontend's actual URL

ACCESS_TOKEN_SECRET=<Your_Access_Token_Secret_String> # e.g., generate a long random string
ACCESS_TOKEN_EXPIRY=1h # e.g., 10m, 1h, 1d

REFRESH_TOKEN_SECRET=<Your_Refresh_Token_Secret_String> # e.g., generate a very long random string
REFRESH_TOKEN_EXPIRY=7d # e.g., 7d, 30d

CLOUDINARY_CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
CLOUDINARY_API_KEY=<Your_Cloudinary_API_Key>
CLOUDINARY_API_SECRET=<Your_Cloudinary_API_Secret>
```
