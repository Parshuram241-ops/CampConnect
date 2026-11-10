import { useState, useRef, useEffect } from "react";
import { Bell, X, Clock, Package } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function NotificationBar() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "product_interest":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "offer":
        return <Package className="h-5 w-5 text-green-600" />;
      case "message":
        return <Bell className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "product_interest":
        return "bg-blue-50 border-blue-200";
      case "offer":
        return "bg-green-50 border-green-200";
      case "message":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-slate-100 dark:bg-slate-700 transition"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-500">{unreadCount} unread</p>
                )}
              </div>

              {unreadCount > 0 && (
                <motion.button
                  onClick={markAllAsRead}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </motion.button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`relative rounded-xl border p-3 cursor-pointer transition hover:shadow-md ${
                        notification.isRead
                          ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                          : `${getNotificationColor(notification.type)}`
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 pt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-600 ml-2 flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {notification.productName && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                              Product: {notification.productName}
                            </p>
                          )}

                          {notification.buyerName && (
                            <p className="text-xs text-slate-500 mt-1">
                              <span className="font-medium">From:</span> {notification.buyerName}
                            </p>
                          )}

                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>

                        {/* Close Button */}
                        <motion.button
                          onClick={() => dismissNotification(notification.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-400"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - View All Link */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-3">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-slate-50 dark:bg-slate-800 rounded-lg transition"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBar;