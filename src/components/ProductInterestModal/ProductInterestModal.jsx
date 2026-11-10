import { useState } from "react";
import { X, Send, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../contexts/NotificationContext";
import toast from "react-hot-toast";

function ProductInterestModal({ product, isOpen, onClose }) {
  const { addNotification } = useNotifications();
  const [interestType, setInterestType] = useState("buy"); // buy or rent
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const user = JSON.parse(localStorage.getItem("campconnectUser"));

  // The product object is expected to be the real backend shape from getAllProducts
  // (product.seller is populated with { _id, name, email, avatar, rating }).

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);

    try {
      // Route the interest through the messaging flow: this creates a message
      // so the seller can reply in the real inbox. Notifications UI already
      // exists and stays as a separate concern.
      const notificationMessage = `${user.name} is interested to ${interestType} "${product.title}"${
        message ? `: "${message}"` : ""
      }`;

      addNotification({
        type: "product_interest",
        title: `New Interest on "${product.title}"`,
        message: notificationMessage,
        productName: product.title,
        productId: product._id || product.id,
        buyerName: user.name,
        buyerEmail: user.email,
        buyerPhone: user.phone,
        buyerMessage: message,
        interestType: interestType,
        sellerId: product.seller?._id || "unknown",
        autoDismiss: false,
      });

      setSubmitted(true);
      toast.success("Interest submitted successfully!");

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setMessage("");
        setInterestType("buy");
      }, 2000);
    } catch (error) {
      console.error("Error submitting interest:", error);
      toast.error("Failed to submit interest. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
        >
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {submitted ? "Interest Submitted!" : "Show Interest"}
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Send className="h-8 w-8 text-green-600" />
                    </motion.div>
                  </motion.div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Successfully Submitted!
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Your interest in{" "}
                    <span className="font-semibold">{product.title}</span> has
                    been sent to the seller.
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    The seller will respond to your interest soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Info */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Product
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {product.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Price: <span className="font-semibold">{product.price}</span>
                    </p>
                  </div>

                  {/* Interest Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Interest Type
                    </label>

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setInterestType("buy")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition ${
                          interestType === "buy"
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        Buy
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => setInterestType("rent")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition ${
                          interestType === "rent"
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        Rent
                      </motion.button>
                    </div>
                  </div>

                  {/* Your Info */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Your Information
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Name:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {user?.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Email:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {user?.email}
                        </span>
                      </div>

                      {user?.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {user.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Message (Optional)
                    </label>

                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add any questions or details about your interest..."
                      maxLength="250"
                      rows="3"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                      {message.length}/250 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Interest
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductInterestModal;