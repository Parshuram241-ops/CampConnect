import { useState, useEffect } from "react";
import { Heart, MapPin, User, MessageCircle, Calendar, Star, Zap, Clock, Flag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useWishlist } from "../../contexts/WishlistContext";
import { useMessaging } from "../../contexts/MessagingContext";
import { reportItem } from "../../services/api";
import ProductInterestModal from "../ProductInterestModal/ProductInterestModal";
import ProductImage from "../common/ProductImage";

function ProductCard({
  id,
  image,
  title,
  price,
  condition,
  seller,
  location,
  type,
  category,
  serverOffset = 0,
  ...fullProduct
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Misleading listing");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [now, setNow] = useState(0);
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { startNewConversation } = useMessaging();
  const inWishlist = isInWishlist(id);
  const dealExpiry = fullProduct.dealExpiresAt ? new Date(fullProduct.dealExpiresAt).getTime() : 0;
  const serverNow = now + serverOffset;
  const isDealActive = Boolean(fullProduct.isDealActive && dealExpiry > serverNow);
  const displayPrice = isDealActive ? price : (fullProduct.originalPrice || price);

  useEffect(() => {
    if (!dealExpiry || dealExpiry <= Date.now() + serverOffset) return undefined;
    const startTimeout = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [dealExpiry, serverOffset]);

  // Resolved primary image
  const resolvedImage = image || fullProduct.images?.[0] || fullProduct.imageUrl || fullProduct.image;
  const imageList = fullProduct.images || (resolvedImage ? [resolvedImage] : []);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id,
      image: resolvedImage,
      images: imageList,
      title,
      condition,
      seller,
      location,
      type,
      category,
    });
  };

  const handleContactSeller = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Check authentication
    const currentUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("campconnectUser") || "null");
      } catch {
        return null;
      }
    })();

    if (!currentUser) {
      toast.error("Please log in to message the seller");
      navigate("/login");
      return;
    }

    // 2. Prevent messaging oneself
    const sellerObj = fullProduct.seller || seller;
    const sellerId =
      sellerObj?._id ||
      sellerObj?.id ||
      (typeof sellerObj === "string" && sellerObj.length === 24
        ? sellerObj
        : null);
    const currentUserId = currentUser._id || currentUser.id;

    if (
      sellerId &&
      currentUserId &&
      sellerId.toString() === currentUserId.toString()
    ) {
      toast.error("You cannot message yourself about your own product");
      return;
    }

    if (
      sellerObj?.name &&
      currentUser.name &&
      sellerObj.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    ) {
      toast.error("You cannot message yourself about your own product");
      return;
    }

    // 3. Start conversation and navigate directly to it
    const targetProduct = {
      id: id || fullProduct._id,
      _id: fullProduct._id || id,
      image: resolvedImage,
      images: imageList,
      title,
      condition,
      seller: typeof sellerObj === "string" ? { name: sellerObj } : sellerObj,
      location,
      type,
      category,
      ...fullProduct,
      price: displayPrice,
    };

    try {
      const convId = await startNewConversation(targetProduct);
      if (convId) {
        navigate("/messages", { state: { conversationId: convId } });
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("campconnectUser") || "null");
      } catch {
        return null;
      }
    })();

    if (!currentUser) {
      toast.error("Please log in to report this listing");
      navigate("/login");
      return;
    }

    const sellerObj = fullProduct.seller || seller;
    const sellerId = sellerObj?._id || sellerObj?.id || null;
    const currentUserId = currentUser._id || currentUser.id;

    if (sellerId && currentUserId && sellerId.toString() === currentUserId.toString()) {
      toast.error("You cannot report your own listing");
      return;
    }

    setShowReportModal(true);
  };

  const handleReportSubmit = async () => {
    const currentUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("campconnectUser") || "null");
      } catch {
        return null;
      }
    })();

    if (!currentUser) {
      toast.error("Please log in to report this listing");
      navigate("/login");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Please select a reason for the report");
      return;
    }

    setSubmittingReport(true);

    try {
      await reportItem({
        type: "Listing",
        reportedId: id || fullProduct._id,
        reason: reportReason,
        details: reportDetails,
      });

      toast.success("Report submitted successfully");
      setShowReportModal(false);
      setReportReason("Misleading listing");
      setReportDetails("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const product = {
    id,
    image: resolvedImage,
    images: imageList,
    title,
    condition,
    seller: typeof seller === 'string' ? { name: seller } : seller,
    location,
    type,
    category,
    ...fullProduct,
    price: displayPrice,
  };

  // Determine if product is new (listed within last 48 hours)
  const isNew = fullProduct.createdAt && (new Date() - new Date(fullProduct.createdAt)) < 48 * 60 * 60 * 1000;

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60">

        {/* Product Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
          <ProductImage
            src={resolvedImage}
            images={imageList}
            category={category}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            containerClassName="relative h-full w-full overflow-hidden"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 z-20 flex flex-col gap-2 items-start">
            <span className="rounded-full bg-white dark:bg-slate-800/90 px-2.5 py-1 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur">
              {type}
            </span>
            {isNew && (
              <span className="animate-pulse rounded-full bg-linear-to-r from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                New
              </span>
            )}
            {isDealActive && (
              <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                LIMITED-TIME DEAL
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlistClick}
            className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${
              inWishlist
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        </div>


        {/* Product Information */}
        <div className="p-4">

          <div className="flex items-start justify-between gap-2">

            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>

            <div className="text-right">
              <p className={`whitespace-nowrap text-base font-bold ${isDealActive ? "text-rose-600" : "text-blue-600"}`}>
                ₹{displayPrice}
              </p>
              {isDealActive && (
                <p className="whitespace-nowrap text-xs text-slate-500 line-through">
                  ₹{fullProduct.originalPrice}
                </p>
              )}
            </div>

          </div>

          {isDealActive && (
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <Clock className="h-3.5 w-3.5" />
              Deal ends in {(() => {
                const seconds = Math.max(0, Math.floor((dealExpiry - serverNow) / 1000));
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return now
                  ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
                  : "--:--:--";
              })()}
            </p>
          )}

          {/* Condition */}
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {condition}
            </span>
          </p>

          {/* Seller & Location */}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{typeof seller === 'string' ? seller : seller?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowInterestModal(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-600 bg-green-50 py-2 text-xs font-semibold text-green-600 transition hover:bg-green-100"
              title="Show interest in this product"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Interest</span>
            </button>
            <button
              onClick={handleContactSeller}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-white dark:bg-slate-800 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Message</span>
            </button>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            {showDetails ? "Hide Details" : "View Details"}
          </button>

          <button
            type="button"
            onClick={handleReportClick}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500 bg-amber-50 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <Flag className="h-3.5 w-3.5" />
            Report Listing
          </button>

          {/* Expanded Details Section */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showDetails ? 'max-h-250 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            {showDetails && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                
                {/* Condition & Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Condition</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{product.condition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                    <p className="text-sm font-semibold text-green-600">
                      {product.status || product.availability || "Available"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Description</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Posted Date */}
                {product.postedDate && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Posted {product.postedDate}</span>
                  </div>
                )}

                {/* Seller Info */}
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <img
                      src={product.seller?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"}
                      alt={product.seller?.name || "Seller"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80";
                      }}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {product.seller?.name || "Unknown Seller"}
                      </p>
                      {product.seller?.department && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {product.seller.department} {product.seller.year ? `• ${product.seller.year}` : ""}
                        </p>
                      )}
                      {product.seller?.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {product.seller.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Brand</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{product.brand || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Negotiable</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {product.negotiable ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleContactSeller}
                    className="w-full rounded-lg border-2 border-blue-600 bg-white dark:bg-slate-800 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    Message Seller
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Report Listing</h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Close report modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Help us review this listing. Please choose a reason and add any details you think are relevant.
            </p>

            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="Misleading listing">Misleading listing</option>
              <option value="Spam or scam">Spam or scam</option>
              <option value="Offensive or inappropriate content">Offensive or inappropriate content</option>
              <option value="Price or payment issue">Price or payment issue</option>
              <option value="Other">Other</option>
            </select>

            <label className="mb-2 mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Details
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={4}
              placeholder="Add any extra context..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportSubmit}
                disabled={submittingReport}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReport ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Interest Modal */}
      <ProductInterestModal
        product={product}
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
      />
    </>
  );
}

export default ProductCard;