import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2, Archive, Package, Clock, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useNotifications } from "../../contexts/NotificationContext";
import toast from "react-hot-toast";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatFullDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function Notifications() {
  const navigate = useNavigate();
  const { notifications, dismissNotification, clearAll, markAsRead } = useNotifications();
  const [filter, setFilter] = useState("all"); // all, unread, product_interest
  
  const [user] = useState(() => {
    try {
      const userData = localStorage.getItem("campconnectUser");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [navigate, user]);

  const currentUserId = user?.id || user?._id;

  // Get seller's notifications only
  const sellerNotifications = notifications.filter(
    (notif) => !currentUserId || notif.sellerId === currentUserId
  );

  // Filter notifications
  const filteredNotifications = sellerNotifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "product_interest") return notif.type === "product_interest";
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "product_interest":
        return <Package className="h-6 w-6 text-blue-600" />;
      default:
        return <Bell className="h-6 w-6 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 py-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Product Inquiries
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage all inquiries from students interested in your products
          </p>
        </motion.div>

        {/* Stats */}
        {sellerNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid gap-4 sm:grid-cols-3"
          >
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Inquiries</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {sellerNotifications.length}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-600">Unread</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">
                {sellerNotifications.filter((n) => !n.isRead).length}
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-600">Products</p>
              <p className="mt-2 text-2xl font-bold text-green-900">
                {new Set(sellerNotifications.map((n) => n.productId)).size}
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex gap-2"
        >
          <motion.button
            onClick={() => setFilter("all")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            All Inquiries
          </motion.button>

          <motion.button
            onClick={() => setFilter("unread")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            Unread
          </motion.button>

          <motion.button
            onClick={() => setFilter("product_interest")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filter === "product_interest"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            Product Interest
          </motion.button>

          {sellerNotifications.length > 0 && (
            <motion.button
              onClick={() => {
                clearAll();
                toast.success("All notifications cleared");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-auto rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50 transition"
            >
              Clear All
            </motion.button>
          )}
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800 p-12 text-center"
            >
              <Bell className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                No inquiries yet
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                When students show interest in your products, they'll appear here
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border-2 p-5 transition ${
                  notification.isRead
                    ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                            New
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Buyer Info */}
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          From Buyer
                        </p>
                        <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                          {notification.buyerName}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Interest Type
                        </p>
                        <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100 capitalize">
                          {notification.interestType}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2">
                        <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {notification.buyerEmail}
                        </span>
                      </div>

                      {notification.buyerPhone && (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2">
                          <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {notification.buyerPhone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Buyer Message */}
                    {notification.buyerMessage && (
                      <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-200">
                        <p className="text-xs font-medium text-blue-600 mb-1">
                          Buyer's Message
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          "{notification.buyerMessage}"
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(notification.timestamp)}</span>
                        <span>•</span>
                        <span>{formatFullDate(notification.timestamp)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <motion.button
                            onClick={() => markAsRead(notification.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Mark as read"
                            className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200"
                          >
                            <Archive className="h-3 w-3" />
                            Mark Read
                          </motion.button>
                        )}

                        <motion.button
                          onClick={() => {
                            dismissNotification(notification.id);
                            toast.success("Notification deleted");
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Delete notification"
                          className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;