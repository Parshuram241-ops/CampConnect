import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Requires user to be logged in
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("campconnectLoggedIn") === "true";
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * PublicOnlyRoute - Only accessible when NOT logged in
 * Redirects to dashboard if already authenticated (for login, register, home)
 */
export function PublicOnlyRoute({ children }) {
  const isLoggedIn = localStorage.getItem("campconnectLoggedIn") === "true";
  
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

/**
 * PublicRoute - Accessible to everyone but redirects home to dashboard if logged in
 */
export function PublicRoute({ children }) {
  // This is for routes that are public but should redirect logged-in users to dashboard
  // Currently used for Home page
  const isLoggedIn = localStorage.getItem("campconnectLoggedIn") === "true";
  
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
