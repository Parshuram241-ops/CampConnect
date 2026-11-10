import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products as fallbackProducts } from "../../constants/products";
import { getAllProducts } from "../../services/api";

function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts.slice(0, 8));

  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        const response = await getAllProducts({ limit: 8, sort: '-createdAt' });
        if (isMounted && response?.data && response.data.length > 0) {
          setFeaturedProducts(response.data.slice(0, 8));
        }
      } catch {
        // Fallback to initial products if backend or query fails
      }
    };
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate products to create a seamless infinite scrolling effect
  const marqueeItems = [...featuredProducts, ...featuredProducts];

  return (
    <section className="bg-slate-50 dark:bg-slate-800 py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
              Featured Listings
            </h2>

            <p className="mt-3 text-slate-500">
              Discover products students are selling, renting and sharing.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View all listings →
          </Link>

        </div>

        {/* Products Marquee */}
        <div className="relative -mx-6 px-6 lg:mx-0 lg:px-0">
          
          {/* Edge Fade Gradients for a premium look */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800 sm:w-24"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-800 sm:w-24"></div>

          <div className="flex w-max animate-marquee gap-6 pb-8 pt-4">
            {marqueeItems.map((product, index) => (
              <div key={`${product._id || product.id}-${index}`} className="w-[280px] shrink-0 sm:w-[320px]">
                <ProductCard
                  id={product._id || product.id}
                  {...product}
                  image={product.images?.[0] || product.image}
                  seller={product.seller}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default FeaturedProducts;