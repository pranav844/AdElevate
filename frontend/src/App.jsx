import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RazorpayModal from "./components/RazorpayModal";
import RatingReviewModal from "./components/RatingReviewModal";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdDetailPage from "./pages/AdDetailPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("adelevate_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [payingAd, setPayingAd] = useState(null);
  const [ratingAd, setRatingAd] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("adelevate_user");
    localStorage.removeItem("adelevate_token");
    setCurrentUser(null);
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-misty">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  cityQuery={cityQuery}
                  setCityQuery={setCityQuery}
                  currentUser={currentUser}
                  onPayAd={(ad) => setPayingAd(ad)}
                  onRateAd={(ad) => setRatingAd(ad)}
                  refreshTrigger={refreshTrigger}
                />
              }
            />
            <Route
              path="/login"
              element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
            />
            <Route
              path="/register"
              element={<RegisterPage onAuthSuccess={handleAuthSuccess} />}
            />
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["VENDOR"]}>
                  <VendorDashboardPage
                    currentUser={currentUser}
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboardPage currentUser={currentUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ad/:id"
              element={<AdDetailPage currentUser={currentUser} />}
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER", "VENDOR", "ADMIN"]}>
                  <CustomerProfilePage
                    currentUser={currentUser}
                    onProfileUpdated={(updated) => setCurrentUser(updated)}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Payment Modal (global overlay) */}
        {payingAd && (
          <RazorpayModal
            ad={payingAd}
            onClose={() => setPayingAd(null)}
            onPaymentSuccess={() => setRefreshTrigger((p) => p + 1)}
          />
        )}

        {/* Rating Modal (global overlay) */}
        {ratingAd && (
          <RatingReviewModal
            ad={ratingAd}
            currentUser={currentUser}
            onClose={() => setRatingAd(null)}
            onReviewSubmitted={() => setRefreshTrigger((p) => p + 1)}
            onLoginRequired={() => {
              setRatingAd(null);
              window.location.href = "/login";
            }}
          />
        )}

        <Footer />
      </div>
    </BrowserRouter>
  );
}
