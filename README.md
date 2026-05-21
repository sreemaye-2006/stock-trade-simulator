# Stock Trade Simulator Web Application

A clean, responsive, and modern finance-themed **Stock Trade Simulator** built using React.js, Tailwind CSS, Node.js, Express.js, and MongoDB (with a seamless fallback to an In-Memory Mock database).

---

## 🌟 Features

- **User Authentication**: Secure Sign Up & Sign In with password hashing (bcrypt) and session management (JWT).
- **Interactive Dashboard**:
  - Wallet overview starting with a virtual balance of **₹100,000**.
  - Dynamic stock search by symbol or company name.
  - Live mock stock price fluctuations (automatically updates on each fetch to feel like a real trading platform).
  - Responsive charts visualizing historical price data.
- **Stock Trading**: Simulates buying and selling stocks using virtual funds. Ensures you can only trade what you can afford or sell shares you currently own.
- **Watchlist**: Toggle "Favorite" stocks with one-click to easily filter them in your dashboard.
- **Asset Portfolio**: Displays all owned shares, quantities, average buy prices, current prices, and dynamically calculates real-time Profit & Loss (P&L).
- **Transaction History**: Real-time log of all buy and sell actions, complete with order types, quantities, transaction prices, and timestamps.
- **Theme Toggle**: Stunning Dark/Light mode toggle that saves your preferences to `localStorage`.

---

## 📂 Project Structure

```
├── backend/
│   ├── dummyData.js       # Dynamic stock dataset generator
│   ├── server.js          # Express app, Mongoose models, authentication, and endpoints
│   └── package.json       # Backend dependencies (express, mongoose, bcrypt, jwt, etc.)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx  # Main navigation with Dark/Light theme toggle
    │   ├── pages/
    │   │   ├── Dashboard.jsx # Active stock list, live charts, watchlist filter & buying/selling logic
    │   │   ├── Portfolio.jsx # Current holdings, P&L calculator & past transactions logs
    │   │   ├── Login.jsx     # Authentication entry page
    │   │   └── Register.jsx  # Sign up form
    │   ├── App.jsx        # Routing structure & core state
    │   └── index.css      # Custom theme defaults & tailwind import
    ├── tailwind.config.js # Tailwind CSS configuration
    └── package.json       # Frontend dependencies (react, recharts, lucide-react, etc.)
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### 🔌 Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *Note: If MongoDB isn't running locally, the server will automatically fallback to a robust **In-Memory Mock Database** seamlessly so you can start trading instantly with zero setup!*

### 💻 Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React/Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173/` to start trading!

---

## 🎨 Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts (Modern chart visualizer), Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), Bcrypt.js.
- **Bonus Feature**: Standalone in-memory fallback database for the ultimate developer experience.
