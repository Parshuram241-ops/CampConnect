import { X, MapPin, Calendar, Star } from "lucide-react";
import { useEffect } from "react";
import ProductImage from "../common/ProductImage";

function ProductHoverCard({ product, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Prevent scroll
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  if (!product) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resolvedImage = product.images?.[0] || product.image || product.imageUrl;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 z-10 shadow-lg"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Product Image */}
            <div className="relative h-64 overflow-hidden rounded-t-3xl bg-slate-100 dark:bg-slate-700">
              <ProductImage
                src={resolvedImage}
                images={product.images || (resolvedImage ? [resolvedImage] : [])}
                category={product.category}
                alt={product.title}
                className="h-full w-full object-cover"
                containerClassName="relative h-full w-full overflow-hidden"
              />
              <span className="absolute left-5 top-5 z-20 rounded-full bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-bold text-blue-600 shadow-md">
                {product.type}
              </span>
            </div>

            {/* Product Info */}
            <div className="p-6">
              {/* Title & Price */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {product.title}
                </h2>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                </p>
              </div>

              {/* Condition & Status Grid */}
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Condition</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{product.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Status</p>
                  <p className="text-base font-semibold text-green-600">{product.status || product.availability || "Available"}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>

              {/* Location & Posted Date */}
              <div className="mb-5 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <span>{product.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <span>Posted {product.postedDate}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 border-t border-slate-200 dark:border-slate-700"></div>

              {/* Seller Info */}
              <div className="rounded-2xl bg-blue-50 p-4 mb-5">
                <div className="flex items-start gap-3">
                  <img
                    src={product.seller?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"}
                    alt={product.seller?.name || "Seller"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80";
                    }}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {product.seller?.name || "Unknown Seller"}
                    </p>
                    {product.seller?.department && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {product.seller.department} {product.seller.year ? `• ${product.seller.year}` : ""}
                      </p>
                    )}
                    {product.seller?.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.seller.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {product.seller.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 font-medium mb-1">Brand</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{product.brand || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium mb-1">Negotiable</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {product.negotiable ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-xl border-2 border-blue-600 bg-white dark:bg-slate-800 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50">
                  Message Seller
                </button>
                <button className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
                  Call Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductHoverCard;
