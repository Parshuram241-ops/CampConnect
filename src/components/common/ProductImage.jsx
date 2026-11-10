import { useState, useMemo } from "react";
import { API_ORIGIN } from "../../services/api";

// Curated, 100% verified 200 OK fallback images for each category
export const CATEGORY_FALLBACK_IMAGES = {
  books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  electronics: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
  "study-materials": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "hostel-essentials": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80",
  "lab-equipment": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  clothing: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  sports: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  others: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
};

export const CATEGORY_META = {
  books: { emoji: "📚", label: "Books", gradient: "from-blue-600 to-indigo-700" },
  electronics: { emoji: "💻", label: "Electronics", gradient: "from-cyan-600 to-blue-700" },
  "study-materials": { emoji: "📝", label: "Study Materials", gradient: "from-amber-600 to-orange-700" },
  furniture: { emoji: "🪑", label: "Furniture", gradient: "from-emerald-600 to-teal-700" },
  "hostel-essentials": { emoji: "🏠", label: "Hostel Essentials", gradient: "from-purple-600 to-indigo-700" },
  "lab-equipment": { emoji: "🔬", label: "Lab Equipment", gradient: "from-violet-600 to-pink-700" },
  clothing: { emoji: "👕", label: "Clothing", gradient: "from-rose-600 to-red-700" },
  sports: { emoji: "⚽", label: "Sports", gradient: "from-teal-600 to-emerald-700" },
  others: { emoji: "📦", label: "Campus Item", gradient: "from-slate-700 to-slate-900" },
};

/**
 * Normalizes category string to lowercase slug with smart alias resolution
 */
export function normalizeCategory(category) {
  if (!category) return "others";
  const slug = category
    .toLowerCase()
    .trim()
    .replace(/[&]/g, "and")
    .replace(/\s+/g, "-");

  if (CATEGORY_FALLBACK_IMAGES[slug]) return slug;

  // Common aliases
  if (slug.includes("book") || slug.includes("textbook")) return "books";
  if (slug.includes("electronic") || slug.includes("tech") || slug.includes("gadget") || slug.includes("laptop") || slug.includes("phone")) return "electronics";
  if (slug.includes("study") || slug.includes("notes") || slug.includes("material")) return "study-materials";
  if (slug.includes("furniture") || slug.includes("chair") || slug.includes("table") || slug.includes("bed") || slug.includes("desk")) return "furniture";
  if (slug.includes("hostel") || slug.includes("dorm") || slug.includes("essential")) return "hostel-essentials";
  if (slug.includes("lab") || slug.includes("apparatus") || slug.includes("microscope")) return "lab-equipment";
  if (slug.includes("cloth") || slug.includes("apparel") || slug.includes("jacket") || slug.includes("hoodie") || slug.includes("wear")) return "clothing";
  if (slug.includes("sport") || slug.includes("fitness") || slug.includes("gym") || slug.includes("cycle") || slug.includes("bike")) return "sports";

  return "others";
}

/**
 * Checks if a string is likely an emoji or single glyph rather than an image URL
 */
export function isEmoji(str) {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return false;
  }
  return trimmed.length <= 4;
}

/**
 * Resolves a full valid URL or returns category fallback
 */
export function resolveImageUrl(rawUrl, category = "others") {
  const normCat = normalizeCategory(category);
  const fallback = CATEGORY_FALLBACK_IMAGES[normCat] || CATEGORY_FALLBACK_IMAGES.others;

  if (!rawUrl) return fallback;

  if (Array.isArray(rawUrl)) {
    const firstValid = rawUrl.find((u) => typeof u === "string" && u.trim().length > 0 && !isEmoji(u));
    return resolveImageUrl(firstValid, category);
  }

  // Handle object shape if { url: "..." } or { secure_url: "..." }
  if (typeof rawUrl === "object" && rawUrl !== null) {
    const extracted = rawUrl.url || rawUrl.secure_url || rawUrl.path || rawUrl.src;
    if (extracted) return resolveImageUrl(extracted, category);
    return fallback;
  }

  if (typeof rawUrl !== "string") return fallback;
  const trimmed = rawUrl.trim();

  // Try parsing JSON string if serialized array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return resolveImageUrl(parsed[0], category);
      }
    } catch {
      // not valid JSON array
    }
  }

  if (isEmoji(trimmed)) {
    return fallback;
  }

  // Prepend backend host if relative upload
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    return `${API_ORIGIN}/${trimmed.replace(/^\/+/, "")}`;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  return fallback;
}

/**
 * ProductImage component with progressive failover, smooth skeleton loading,
 * instant cached-image detection, and elegant branded fallback state.
 */
function ProductImage({
  src,
  alt = "Product image",
  category = "others",
  images = [],
  className = "h-full w-full object-cover",
  containerClassName = "relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-700",
  aspectRatio,
  priority = false,
}) {
  const normCat = normalizeCategory(category);
  const meta = CATEGORY_META[normCat] || CATEGORY_META.others;
  const fallbackUrl = CATEGORY_FALLBACK_IMAGES[normCat] || CATEGORY_FALLBACK_IMAGES.others;

  // Build candidate URLs in order of preference
  const candidates = useMemo(() => {
    const list = [];

    // 1. Primary provided src
    if (src && typeof src === "string" && !isEmoji(src)) {
      list.push(resolveImageUrl(src, category));
    } else if (src && typeof src === "object") {
      list.push(resolveImageUrl(src, category));
    }

    // 2. Secondary images in array if available
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img && (typeof img === "string" ? !isEmoji(img) : true)) {
          const resolved = resolveImageUrl(img, category);
          if (!list.includes(resolved)) list.push(resolved);
        }
      });
    }

    // 3. Category fallback
    if (!list.includes(fallbackUrl)) {
      list.push(fallbackUrl);
    }

    return list.filter(Boolean);
  }, [src, images, category, fallbackUrl]);

  return (
    <ImageRenderer
      key={`${category}:${candidates.join("|")}`}
      candidates={candidates}
      fallbackUrl={fallbackUrl}
      meta={meta}
      alt={alt}
      priority={priority}
      className={className}
      containerClassName={containerClassName}
      aspectRatio={aspectRatio}
    />
  );
}

function ImageRenderer({
  candidates,
  fallbackUrl,
  meta,
  alt,
  priority,
  className,
  containerClassName,
  aspectRatio,
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [allFailed, setAllFailed] = useState(false);
  const currentUrl = candidates[candidateIndex] || fallbackUrl;

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
      setIsLoaded(false);
    } else {
      setAllFailed(true);
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={containerClassName} style={aspectRatio ? { aspectRatio } : undefined}>
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && !allFailed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 animate-pulse">
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <span className="text-2xl">{meta.emoji}</span>
            <span className="text-[10px] font-semibold text-slate-400">Loading image...</span>
          </div>
        </div>
      )}

      {/* Styled Campus Fallback if offline/all URLs fail */}
      {allFailed ? (
        <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${meta.gradient} p-4 text-white shadow-inner`}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800/20 text-3xl shadow-md backdrop-blur-sm">
            {meta.emoji}
          </div>
          <p className="mt-2 text-xs font-bold tracking-wide uppercase text-white/90">
            {meta.label}
          </p>
          <span className="mt-1 rounded-full bg-white dark:bg-slate-800/20 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            CampConnect Verified
          </span>
        </div>
      ) : (
        <img
          key={currentUrl}
          src={currentUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

export default ProductImage;
