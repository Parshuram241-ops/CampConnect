import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import ProductCard from "../../components/product/ProductCard";
import { getAllProducts } from "../../services/api";
import toast from "react-hot-toast";

// Category mapping: slug to display name
const categoryMap = {
  "books": "Books",
  "electronics": "Electronics",
  "study-materials": "Study Materials",
  "furniture": "Furniture",
  "hostel-essentials": "Hostel Essentials",
  "lab-equipment": "Lab Equipment",
  "clothing": "Clothing",
  "others": "Others",
};

const categories = [
  "All",
  "Books",
  "Electronics",
  "Study Materials",
  "Furniture",
  "Hostel Essentials",
  "Lab Equipment",
  "Clothing",
  "Others",
];

const conditions = ["All", "Like New", "Excellent", "Good", "Fair"];
const types = ["All", "For Sale", "For Rent", "Exchange", "Borrow"];

function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive selected category and search query from searchParams directly
  const categoryParam = searchParams.get("category");
  const selectedCategory = (categoryParam && categoryMap[categoryParam]) || "All";
  const searchQuery = searchParams.get("search") || "";
  const dealsOnly = searchParams.get("deals") === "true";

  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [serverOffset, setServerOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = {
          status: 'Available',
          page: currentPage,
          limit: 20,
        };
        if (dealsOnly) filters.dealsOnly = true;

        // Add filters if set
        if (selectedCategory !== 'All') {
          const slug = Object.keys(categoryMap).find(
            (key) => categoryMap[key] === selectedCategory
          );
          if (slug) filters.category = slug;
        }

        if (selectedType !== 'All') filters.type = selectedType;
        if (selectedCondition !== 'All') filters.condition = selectedCondition;
        if (searchQuery.trim()) filters.search = searchQuery.trim();
        if (priceRange.min) filters.minPrice = priceRange.min;
        if (priceRange.max) filters.maxPrice = priceRange.max;

        // Add sort
        if (sortBy === 'price-low') filters.sort = 'price';
        else if (sortBy === 'price-high') filters.sort = '-price';
        else filters.sort = '-createdAt';

        const response = await getAllProducts(filters);
        if (isMounted) {
          setProducts(response.data || []);
          setTotalProducts(response.pagination?.total || 0);
          setTotalPages(Math.max(1, response.pagination?.pages || 1));
          setServerOffset(response.serverTime ? new Date(response.serverTime).getTime() - Date.now() : 0);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching products:', error);
          toast.error('Failed to load products');
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedType, selectedCondition, searchQuery, priceRange, sortBy, dealsOnly, currentPage]);

  // Update URL when category changes manually
  const handleCategoryChange = (category) => {
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (category === "All") {
      nextParams.delete("category");
    } else {
      const slug = Object.keys(categoryMap).find(
        (key) => categoryMap[key] === category
      );
      if (slug) {
        nextParams.set("category", slug);
      }
    }
    setSearchParams(nextParams);
  };

  // Update URL when search query changes
  const handleSearchChange = (value) => {
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set("search", value.trim());
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams);
  };

  // Filter and sort products (now done server-side, but keeping for client-side adjustments)
  const filteredProducts = products;

  const clearFilters = () => {
    setCurrentPage(1);
    setSelectedCondition("All");
    setSelectedType("All");
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    selectedCondition !== "All",
    selectedType !== "All",
    priceRange.min,
    priceRange.max,
  ].filter(Boolean).length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              {dealsOnly ? "Limited-Time Deals" : selectedCategory !== "All" ? selectedCategory : "Marketplace"}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {searchQuery ? (
                <>
                  Search results for "<span className="font-semibold text-slate-900 dark:text-slate-100">{searchQuery}</span>"
                  {selectedCategory !== "All" && ` in ${selectedCategory}`}
                </>
              ) : dealsOnly ? (
                "Browse discounted products before their deals expire"
              ) : selectedCategory !== "All" ? (
                `Browse ${selectedCategory.toLowerCase()} from students across your campus`
              ) : (
                "Discover products from students across your campus"
              )}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, sellers..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-3 pl-12 pr-4 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setCurrentPage(1);
                setSortBy(e.target.value);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-semibold transition hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-6">
            
            {/* Filters Sidebar */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } w-full space-y-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:block md:w-72 md:shrink-0`}
            >
              
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Listing Type</h3>
                <div className="space-y-2">
                  {types.map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="type"
                        checked={selectedType === type}
                      onChange={() => {
                        setCurrentPage(1);
                        setSelectedType(type);
                      }}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Condition</h3>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <label
                      key={condition}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === condition}
                      onChange={() => {
                        setCurrentPage(1);
                        setSelectedCondition(condition);
                      }}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setPriceRange((range) => ({ ...range, min: e.target.value }));
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setPriceRange((range) => ({ ...range, max: e.target.value }));
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {totalProducts}
                  </span>{" "}
                  {totalProducts === 1 ? "product" : "products"} found
                </p>

                {/* Mobile Filter Close */}
                {showFilters && (
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 md:hidden"
                  >
                    <X className="h-4 w-4" />
                    Close Filters
                  </button>
                )}
              </div>

              {/* Products */}
              {loading ? (
                <div className="flex min-h-100 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading products...</p>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product._id || product.id} 
                      id={product._id || product.id}
                      image={product.images?.[0] || product.image}
                      title={product.title}
                      price={product.price}
                      condition={product.condition}
                      seller={product.seller?.name || product.seller}
                      location={product.location}
                      type={product.type}
                      category={product.category}
                      {...product}
                      serverOffset={serverOffset}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
                  <div className="mb-4 text-6xl">🔍</div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                    No products found
                  </h3>
                  <p className="mb-6 text-slate-600 dark:text-slate-400">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={clearFilters}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {totalPages > 1 && !loading && (
                <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {(currentPage - 1) * 20 + 1}–
                    {Math.min(currentPage * 20, totalProducts)} of {totalProducts}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage >= totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Marketplace;
