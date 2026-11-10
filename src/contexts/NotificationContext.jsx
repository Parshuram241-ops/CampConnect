import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const savedNotifications = localStorage.getItem("campconnectNotifications");
      if (savedNotifications) {
        return JSON.parse(savedNotifications);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
    return [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("campconnectNotifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  }, [notifications]);

  // Derived unread count - avoids redundant state synchronization
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Dismiss/delete notification
  const dismissNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, []);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());

    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Optional: Auto-dismiss after 5 seconds (can be disabled per notification)
    if (notification.autoDismiss !== false) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 5000);
    }

    return newNotification.id;
  }, [dismissNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get notifications for specific seller (user)
  const getSellerNotifications = useCallback((sellerId) => {
    return notifications.filter((notif) => notif.sellerId === sellerId);
  }, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    getSellerNotifications,
  }), [
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    getSellerNotifications,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;