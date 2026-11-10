import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import ProductCard from "../../components/product/ProductCard";
import { useWishlist } from "../../contexts/WishlistContext";

function Wishlist() {
  const { wishlist, clearWishlist, wishlistCount } = useWishlist();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">My Wishlist</h1>
              </div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {wishlistCount === 0
                  ? "Your wishlist is empty"
                  : `${wishlistCount} ${wishlistCount === 1 ? "item" : "items"} saved`}
              </p>
            </div>

            {wishlistCount > 0 && (
              <button
                onClick={clearWishlist}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white dark:bg-slate-800 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
                Clear Wishlist
              </button>
            )}
          </div>

          {/* Wishlist Content */}
          {wishlistCount > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Heart className="h-12 w-12 text-slate-400" />
              </div>
              
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                Your wishlist is empty
              </h2>
              
              <p className="mb-8 max-w-md text-slate-600 dark:text-slate-400">
                Start adding products to your wishlist by clicking the heart icon on products you like. 
                They'll be saved here for easy access later.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/marketplace"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Browse Marketplace
                </Link>
                
                <Link
                  to="/"
                  className="rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Info Cards */}
          {wishlistCount > 0 && (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">Save for Later</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Products in your wishlist are saved across devices. Access them anytime.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">Quick Access</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Jump back to your favorite products and contact sellers directly.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">Get Notified</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive alerts when prices drop or sellers update their listings.
                </p>
              </div>

            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Wishlist;
