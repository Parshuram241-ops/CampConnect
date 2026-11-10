import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "../components/ProtectedRoute";

// Code-split pages for optimized lazy loading and small bundle chunks
const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Marketplace = lazy(() => import("../pages/Marketplace/Marketplace"));
const Wishlist = lazy(() => import("../pages/Wishlist/Wishlist"));
const Messages = lazy(() => import("../pages/Messages/Messages"));
const AddProduct = lazy(() => import("../pages/AddProduct/AddProduct"));
const EditProduct = lazy(() => import("../pages/EditProduct/EditProduct"));
const OTPVerification = lazy(() => import("../pages/OTPVerification/OTPVerification"));
const GoogleCallback = lazy(() => import("../pages/GoogleCallback/GoogleCallback"));
const GoogleSuccess = lazy(() => import("../pages/GoogleSuccess/GoogleSuccess"));
const EditProfile = lazy(() => import("../pages/EditProfile/EditProfile"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard/AdminDashboard"));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Only Routes - Redirect to dashboard if logged in */}
          <Route 
            path="/" 
            element={
              <PublicOnlyRoute>
                <Home />
              </PublicOnlyRoute>
            } 
          />

          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } 
          />

          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            } 
          />

          {/* Auth Routes - Accessible during authentication flow */}
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          {/* Protected Routes - Require login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-product/:id"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;