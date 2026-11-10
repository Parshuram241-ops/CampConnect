import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, LogOut, Settings, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useWishlist } from "../../contexts/WishlistContext";
import { useMessaging } from "../../contexts/MessagingContext";
import NotificationBar from "../NotificationBar/NotificationBar";

function Navbar() {
  const { wishlistCount } = useWishlist();
  const { unreadCount } = useMessaging();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    try {
      const loggedInStatus = localStorage.getItem("campconnectLoggedIn");
      const userData = localStorage.getItem("campconnectUser");
      if (loggedInStatus === "true" && userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error("Error reading initial user:", error);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("campconnectLoggedIn") === "true";
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("campconnectDarkMode") === "true";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("campconnectDarkMode", "true");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("campconnectDarkMode", "false");
    }
  }, [isDarkMode]);

  const photoPreview = user?.avatar || "";

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("campconnectLoggedIn");
    localStorage.removeItem("campconnectUser");
    localStorage.removeItem("campconnectToken");
    
    // Reset state
    setIsLoggedIn(false);
    setUser(null);
    
    // Redirect to login
    navigate("/login");
  };

  // Logo redirects to dashboard if logged in, home if not
  const logoLink = isLoggedIn ? "/dashboard" : "/";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md dark:border-white/10 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to={logoLink} className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all duration-200 inline-block">
          CampConnect
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          
          {/* Show Home link only if NOT logged in */}
          {!isLoggedIn && (
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-block"
            >
              Home
            </Link>
          )}

          {/* Show Dashboard link only if logged in */}
          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-block"
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/marketplace"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-block"
          >
            Marketplace
          </Link>

          <Link
            to="/messages"
            className="relative text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="relative text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </div>
          </Link>

          {/* Show different UI based on login status */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform duration-200 cursor-pointer"
                  />
                )}

                {/* User Name */}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user && typeof user === 'object' ? (user.name || "User") : "User"}
                </span>
              </div>

              {/* Notification Bell */}
              <div className="hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
                <NotificationBar />
              </div>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                {/* Dropdown Card */}
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-800 p-2 shadow-xl z-50">
                    <Link
                      to="/edit-profile"
                      onClick={() => setIsSettingsOpen(false)}
                      className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200"
                    >
                      Edit Profile
                    </Link>

                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        {isDarkMode ? <Sun className="h-4 w-4 text-blue-400" /> : <Moon className="h-4 w-4" />}
                        <span>Dark Mode</span>
                      </div>
                      <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-800 transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-white/10"></div>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:translate-x-1 transition-all duration-200"
                      >
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:translate-x-1 active:scale-95 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-block"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-500 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 inline-block shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;