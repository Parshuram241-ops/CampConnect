import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const WishlistContext = createContext();

const getWishlistStorageKey = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("campconnectUser") || "null");
    const userId = currentUser?._id || currentUser?.id;
    return userId ? `campconnect_wishlist_${userId}` : "campconnect_wishlist_guest";
  } catch {
    return "campconnect_wishlist_guest";
  }
};

const readWishlist = (storageKey) => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading wishlist:", error);
    return [];
  }
};

export function WishlistProvider({ children }) {
  const [storageKey, setStorageKey] = useState(getWishlistStorageKey());
  const [wishlist, setWishlist] = useState(() => readWishlist(getWishlistStorageKey()));

  useEffect(() => {
    const syncWishlistFromAuth = () => {
      const nextKey = getWishlistStorageKey();
      setStorageKey(nextKey);
      setWishlist(readWishlist(nextKey));
    };

    syncWishlistFromAuth();
    window.addEventListener("campconnect-auth-changed", syncWishlistFromAuth);

    return () => {
      window.removeEventListener("campconnect-auth-changed", syncWishlistFromAuth);
    };
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }, [wishlist, storageKey]);

  const addToWishlist = (product) => {
    if (isInWishlist(product.id)) {
      return;
    }
    setWishlist((prev) => {
      // Check if product already exists (as a fallback)
      if (prev.find((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
    toast.success("Added to wishlist!");
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    toast.success("Removed from wishlist");
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.success("Wishlist cleared");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
