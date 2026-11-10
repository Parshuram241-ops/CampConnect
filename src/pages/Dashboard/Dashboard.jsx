import {
  Package,
  Heart,
  MessageCircle,
  Tag,
  Plus,
  ShoppingBag,
  ArrowRight,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api, { deleteProduct, getMyListings } from "../../services/api";
import ProductImage from "../../components/common/ProductImage";
import FlashZone from "../../components/dashboard/FlashZone";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const stats = [
  {
    title: "My Listings",
    value: "12",
    icon: Package,
    description: "Active products",
    trend: "+2",
    trendLabel: "this month",
    color: "blue",
    link: "/dashboard/listings",
  },
  {
    title: "Wishlist",
    value: "8",
    icon: Heart,
    description: "Saved products",
    trend: "+3",
    trendLabel: "this week",
    color: "red",
    link: "/wishlist",
  },
  {
    title: "Active Offers",
    value: "3",
    icon: Tag,
    description: "Pending offers",
    trend: "1",
    trendLabel: "pending review",
    color: "amber",
    link: "/dashboard/offers",
  },
  {
    title: "Messages",
    value: "5",
    icon: MessageCircle,
    description: "Unread messages",
    trend: "+5",
    trendLabel: "today",
    color: "green",
    link: "/messages",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "offer",
    title: "New offer received",
    description: "Your listing Engineering Mathematics received a new offer of ₹400.",
    time: "2 hours ago",
    icon: Tag,
    color: "blue",
  },
  {
    id: 2,
    type: "message",
    title: "New message",
    description: "You have a new message about Scientific Calculator.",
    time: "5 hours ago",
    icon: MessageCircle,
    color: "green",
  },
  {
    id: 3,
    type: "sold",
    title: "Item sold",
    description: "Your Study Table has been marked as sold.",
    time: "1 day ago",
    icon: CheckCircle,
    color: "emerald",
  },
  {
    id: 4,
    type: "view",
    title: "Listing views",
    description: "Your Engineering Mathematics listing has reached 20+ views.",
    time: "2 days ago",
    icon: TrendingUp,
    color: "purple",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [dealRequestProduct, setDealRequestProduct] = useState(null);
  const [dealRequestForm, setDealRequestForm] = useState({ dealPrice: "", dealExpiresAt: "" });
  const [dealRequestSubmitting, setDealRequestSubmitting] = useState(false);
  const [clockNow, setClockNow] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getMyListings()
      .then((response) => {
        if (isMounted) setRecentListings(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to load seller listings:", error);
        if (isMounted) toast.error(error.response?.data?.message || "Could not load your listings");
      })
      .finally(() => {
        if (isMounted) setListingsLoading(false);
      });
    const startTimeout = setTimeout(() => setClockNow(Date.now()), 0);
    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
    };
  }, []);

  const user = (() => {
    try {
      const userData = localStorage.getItem("campconnectUser");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  })();

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
        hover: "hover:bg-blue-100",
      },
      red: {
        bg: "bg-red-50",
        text: "text-red-500",
        border: "border-red-200",
        hover: "hover:bg-red-100",
      },
      amber: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
        hover: "hover:bg-amber-100",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        hover: "hover:bg-green-100",
      },
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
        hover: "hover:bg-emerald-100",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
        hover: "hover:bg-purple-100",
      },
    };
    return colors[color] || colors.blue;
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteProduct(id);
        setRecentListings((prev) => prev.filter((item) => item._id !== id));
        toast.success("Listing deleted");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete listing");
      }
    }
  };

  const handleEditListing = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleDealRequestSubmit = async (event) => {
    event.preventDefault();
    if (!dealRequestProduct) return;
    const dealPrice = Number(dealRequestForm.dealPrice);
    const dealExpiresAt = new Date(dealRequestForm.dealExpiresAt);
    if (!Number.isFinite(dealPrice) || dealPrice <= 0 || dealPrice >= dealRequestProduct.price) {
      toast.error("Enter a deal price lower than your listing price");
      return;
    }
    if (!dealRequestForm.dealExpiresAt || Number.isNaN(dealExpiresAt.getTime()) || dealExpiresAt <= new Date()) {
      toast.error("Choose a deal end time in the future");
      return;
    }

    try {
      setDealRequestSubmitting(true);
      const response = await api.post(`/products/${dealRequestProduct._id}/deal-request`, {
        dealPrice,
        dealExpiresAt: dealExpiresAt.toISOString(),
      });
      setRecentListings((current) => current.map((product) =>
        product._id === dealRequestProduct._id ? response.data.data : product
      ));
      setDealRequestProduct(null);
      setDealRequestForm({ dealPrice: "", dealExpiresAt: "" });
      toast.success("Your discount request was sent to the admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send deal request");
    } finally {
      setDealRequestSubmitting(false);
    }
  };

  const handleCancelDealRequest = async (product) => {
    const isLiveDeal = product.dealRequest?.status === "Approved" &&
      product.dealExpiresAt && new Date(product.dealExpiresAt) > new Date();
    if (isLiveDeal && !window.confirm("End your active deal now? Shoppers will no longer see the discounted price.")) {
      return;
    }
    try {
      const response = await api.delete(`/products/${product._id}/deal-request`);
      setRecentListings((current) => current.map((item) =>
        item._id === product._id ? response.data.data : item
      ));
      toast.success(isLiveDeal ? "Your deal has ended" : "Deal request withdrawn");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not cancel the deal request");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            CampConnect
          </Link>

          <div className="flex items-center gap-4">

            <Link
              to="/marketplace"
              className="hidden text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 md:block"
            >
              Marketplace
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

          </div>

        </div>
      </nav>


      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-start justify-between"
        >

          <div>
            <p className="text-sm font-medium text-blue-600">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
              Welcome back, {user?.name || "Student"} 👋
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your marketplace activity from one place.
            </p>
          </div>



        </motion.div>


        {/* ================= FLASH ZONE ================= */}
        <FlashZone />


        {/* ================= MARKETPLACE FEATURES ================= */}

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
            {/* Background mesh/gradient decoration */}
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-50/50 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">

            {/* Header */}
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Your Campus. Your Marketplace.
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
                Buy, Sell & Connect 🎯
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Everything you need in one marketplace
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {/* Feature 1: Browse */}
              <div className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">Browse Products</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Explore thousands of items from fellow students
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-600">Live now</span>
                </div>
              </div>

              {/* Feature 2: Sell */}
              <div className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 transition-all hover:border-emerald-300 hover:shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Tag className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">List Items</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sell or rent your items in minutes
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Package className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">Quick listing</span>
                </div>
              </div>

              {/* Feature 3: Message */}
              <div className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 transition-all hover:border-purple-300 hover:shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">Chat Directly</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect with buyers and sellers instantly
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium text-purple-600">Real-time chat</span>
                </div>
              </div>

              {/* Feature 4: Save */}
              <div className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 transition-all hover:border-pink-300 hover:shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <Heart className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">Save Favorites</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Build your wishlist and never miss a deal
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Star className="h-3 w-3 fill-pink-500 text-pink-500" />
                  <span className="text-xs font-medium text-pink-600">Track items</span>
                </div>
              </div>

            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/marketplace"
                className="group flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/add-product"
                className="group flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white dark:bg-slate-800 px-8 py-3 font-bold text-slate-700 dark:text-slate-300 transition-all hover:border-blue-600 hover:text-blue-600"
              >
                <Plus className="h-5 w-5" />
                <span>Sell an Item</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">500+</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Active Listings</p>
              </div>
              <div className="text-center border-x border-slate-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">1000+</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Happy Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">24/7</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Available</p>
              </div>
            </div>
            
            </div>
          </div>
        </motion.section>


        {/* ================= STATS ================= */}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >

          {stats.map((stat) => {

            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);

            return (
              <motion.div key={stat.title} variants={itemVariants}>
                <Link
                  to={stat.link}
                  className="block h-full group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Background Gradient */}
                <div className={`absolute inset-0 ${colors.bg} opacity-0 transition-opacity group-hover:opacity-100`} />

                <div className="relative flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {stat.description}
                    </p>

                    {/* Trend Info */}
                    <div className="mt-3 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-600">
                        {stat.trend}
                      </span>
                      <span className="text-xs text-slate-400">
                        {stat.trendLabel}
                      </span>
                    </div>

                  </div>

                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>

                </div>

                  {/* Bottom Border Effect */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bg} opacity-0 transition-opacity group-hover:opacity-100`} />

                </Link>
              </motion.div>
            );

          })}

        </motion.div>


        {/* ================= QUICK ACTIONS ================= */}

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              What would you like to do?
            </p>
          </div>


          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >

            <motion.div variants={itemVariants}>
            <Link
              to="/add-product"
              className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border-2 border-blue-600 bg-linear-to-br from-blue-600 to-blue-700 p-5 text-white transition hover:shadow-xl hover:scale-105"
            >

              {/* Animated Background */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-700 to-blue-800 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800/20 backdrop-blur-sm">
                <Plus className="h-6 w-6" />
              </div>

              <div className="relative">
                <h3 className="font-bold text-lg">
                  Sell an Item
                </h3>

                <p className="mt-1 text-xs text-blue-100">
                  Create a new listing
                </p>
              </div>

              <ArrowRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />

            </Link>
            </motion.div>


            <motion.div variants={itemVariants}>
            <Link
              to="/marketplace"
              className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Browse Marketplace
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Find products
                </p>
              </div>

              <ArrowRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />

            </Link>
            </motion.div>


            <motion.div variants={itemVariants}>
            <Link
              to="/wishlist"
              className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition hover:border-red-300 hover:shadow-lg hover:-translate-y-1"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-transform group-hover:scale-110">
                <Heart className="h-6 w-6 group-hover:fill-red-500" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  My Wishlist
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  View saved products
                </p>
              </div>

              <ArrowRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />

            </Link>
            </motion.div>


            <motion.div variants={itemVariants}>
            <Link
              to="/messages"
              className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition hover:border-green-300 hover:shadow-lg hover:-translate-y-1"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-transform group-hover:scale-110">
                <MessageCircle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Messages
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Chat with students
                </p>
              </div>

              {/* Notification Badge */}
              <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                5
              </span>

              <ArrowRight className="absolute right-4 bottom-4 h-5 w-5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />

            </Link>
            </motion.div>

          </motion.div>

        </motion.section>


        {/* ================= RECENT LISTINGS ================= */}

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Your Recent Listings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the products you've listed.
              </p>
            </div>

            <span className="text-sm text-slate-500">{recentListings.length} listings</span>

          </div>


          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
          >

            {listingsLoading ? (
              <p className="p-6 text-sm text-slate-500">Loading your listings...</p>
            ) : recentListings.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">You have not listed any products yet.</p>
            ) : recentListings.map((item, index) => (

              <motion.div
                variants={itemVariants}
                key={item._id}
                className={`group flex flex-col gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-700 sm:flex-row sm:items-center sm:justify-between ${index !== recentListings.length - 1
                    ? "border-b border-slate-100 dark:border-slate-800"
                    : ""
                  }`}
              >

                <div className="flex items-center gap-4">

                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-linear-to-br from-blue-50 to-blue-100 text-2xl border border-slate-100 dark:border-slate-800">
                    {item.images?.[0] ? (
                      <ProductImage
                        src={item.images[0]}
                        category={item.category}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        containerClassName="h-full w-full"
                      />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">

                      <span className="font-medium text-blue-600">
                        ₹{Number(item.price).toLocaleString()}
                      </span>

                      <span>•</span>

                      <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5">
                        {item.type}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                    </div>

                    {/* Stats */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {item.dealRequest?.status ? `Deal ${item.dealRequest.status.toLowerCase()}` : "No deal request"}
                      </span>
                    </div>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.status === "Available"
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-700"
                      }`}
                  >
                    {item.status}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">

                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleEditListing(item._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteListing(item._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>

                </div>

                {item.type === "For Sale" && item.status === "Available" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {item.dealRequest?.status === "Pending" &&
                      new Date(item.dealRequest.expiresAt) > new Date() ? (
                      <>
                        <span className="text-xs text-amber-700">
                          Requested ₹{item.dealRequest.dealPrice} until {new Date(item.dealRequest.expiresAt).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCancelDealRequest(item)}
                          className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                        >
                          Withdraw request
                        </button>
                      </>
                    ) : item.dealRequest?.status === "Approved" &&
                      item.dealExpiresAt && new Date(item.dealExpiresAt) > new Date() ? (
                      <>
                        <span className="text-xs font-semibold text-emerald-700">
                          Deal live: ₹{item.dealPrice} until {new Date(item.dealExpiresAt).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCancelDealRequest(item)}
                          className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          End deal
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDealRequestProduct(item);
                          setDealRequestForm({ dealPrice: "", dealExpiresAt: "" });
                        }}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        {["Rejected", "Withdrawn", "Ended"].includes(item.dealRequest?.status)
                          ? "Request another deal"
                          : "Request limited-time discount"}
                      </button>
                    )}
                    {item.dealRequest?.status === "Rejected" && (
                      <span className="text-xs text-rose-600">Previous request rejected</span>
                    )}
                  </div>
                )}

              </motion.div>

            ))}

          </motion.div>

          {dealRequestProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
              <form
                onSubmit={handleDealRequestSubmit}
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Request a temporary discount
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  You choose and agree to the advertised price and end time. The deal goes live only after admin approval.
                </p>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
                  {dealRequestProduct.title} · Regular price ₹{dealRequestProduct.price}
                </p>
                <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Your agreed deal price (₹)
                  <input
                    required
                    type="number"
                    min="0.01"
                    max={dealRequestProduct.price - 0.01}
                    step="0.01"
                    value={dealRequestForm.dealPrice}
                    onChange={(event) => setDealRequestForm((form) => ({ ...form, dealPrice: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Deal end time
                  <input
                    required
                    type="datetime-local"
                    min={clockNow ? new Date(clockNow - new Date(clockNow).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : undefined}
                    value={dealRequestForm.dealExpiresAt}
                    onChange={(event) => setDealRequestForm((form) => ({ ...form, dealExpiresAt: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                  />
                </label>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDealRequestProduct(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dealRequestSubmitting}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {dealRequestSubmitting ? "Sending..." : "Send request"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </motion.section>


        {/* ================= ACTIVITY ================= */}

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest marketplace activities
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </button>

          </div>


          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >

            {recentActivities.map((activity) => {

              const Icon = activity.icon;
              const colors = getColorClasses(activity.color);

              return (
                <motion.div
                  variants={itemVariants}
                  key={activity.id}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition hover:shadow-md hover:-translate-y-0.5"
                >

                  <div className="flex gap-4">

                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition-transform group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1">

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {activity.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {activity.description}
                      </p>

                      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>

                    </div>

                    <button className="h-9 shrink-0 rounded-lg px-4 text-sm font-medium text-blue-600 opacity-0 transition-all hover:bg-blue-50 group-hover:opacity-100">
                      View
                    </button>

                  </div>

                </motion.div>
              );

            })}

          </motion.div>

        </motion.section>


        {/* ================= PERFORMANCE INSIGHTS ================= */}

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Performance Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track your marketplace performance
            </p>
          </div>


          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >

            {/* Total Revenue */}
            <motion.div variants={itemVariants} className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-emerald-500 to-emerald-600 p-6 text-white transition hover:shadow-xl hover:-translate-y-1">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-emerald-100">
                    Total Earnings
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    ₹12,450
                  </p>

                  <p className="mt-1 text-xs text-emerald-100">
                    From 8 sales
                  </p>

                  <div className="mt-3 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      +₹2,340 this month
                    </span>
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800/20">
                  <DollarSign className="h-6 w-6" />
                </div>

              </div>

            </motion.div>


            {/* Profile Views */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition hover:shadow-lg hover:-translate-y-1">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Profile Views
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    234
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    This month
                  </p>

                  <div className="mt-3 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">
                      +18% from last month
                    </span>
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Eye className="h-6 w-6" />
                </div>

              </div>

            </motion.div>


            {/* Response Rate */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition hover:shadow-lg hover:-translate-y-1">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Response Rate
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    94%
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Avg. response time: 2h
                  </p>

                  <div className="mt-3 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">
                      Excellent rating
                    </span>
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MessageCircle className="h-6 w-6" />
                </div>

              </div>

            </motion.div>

          </motion.div>

        </motion.section>

      </main>

    </div>
  );
}

export default Dashboard;