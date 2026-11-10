import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  EyeOff,
  Flag,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import api, { clearAuthSession } from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dealRequests, setDealRequests] = useState([]);
  const [adminData] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("campconnectUser") || "null");
      if (!user) return null;
      return {
        ...user,
        token: user.token || localStorage.getItem("campconnectToken"),
      };
    } catch {
      return null;
    }
  });
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const fetchAdminData = useCallback(async (token) => {
    try {
      setLoading(true);
      setLoadError("");
      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [usersRes, productsRes, reportsRes, statsRes, dealRequestsRes] = await Promise.all([
        api.get("/admin/users", config),
        api.get("/admin/products", config),
        api.get("/admin/reports", config),
        api.get("/admin/stats", config),
        api.get("/admin/deal-requests", config)
      ]);
      setUsers(usersRes.data.data);
      setListings(productsRes.data.data);
      setReports(reportsRes.data.data);
      setStats(statsRes.data.data);
      setDealRequests(dealRequestsRes.data.data);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || error.message || "Failed to load admin data. Please try again.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminData) {
      clearAuthSession();
      navigate("/login");
      return;
    }
    if (adminData.role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    if (!adminData.token) {
      clearAuthSession();
      navigate("/login?session=expired");
      return;
    }
    // This callback defers all state updates until its asynchronous request begins.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading dashboard data is asynchronous.
    fetchAdminData(adminData.token);
  }, [adminData, fetchAdminData, navigate]);

  const handleSuspendUser = async (id, currentStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminData.token}` } };
      const newStatus = currentStatus === "Suspended" ? "Active" : "Suspended";
      await api.put(`/admin/users/${id}/suspend`, { status: newStatus }, config);
      setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      toast.success("User status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (id) => {
    if(window.confirm("Are you sure you want to delete this user?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${adminData.token}` } };
        await api.delete(`/admin/users/${id}`, config);
        setUsers(users.filter(u => u._id !== id));
        setStats((currentStats) => currentStats ? {
          ...currentStats,
          totalUsers: Math.max(0, currentStats.totalUsers - 1),
        } : currentStats);
        toast.success("User deleted permanently");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleToggleListing = async (id, currentStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminData.token}` } };
      const newStatus = currentStatus === "Inactive" ? "Available" : "Inactive";
      const listing = listings.find((item) => item._id === id);
      await api.put(`/admin/products/${id}/toggle`, { status: newStatus }, config);
      setListings(listings.map(l => l._id === id ? { ...l, status: newStatus } : l));
      setStats((currentStats) => currentStats ? {
        ...currentStats,
        availableProducts: currentStats.availableProducts + Number(newStatus === "Available") - Number(currentStatus === "Available"),
        inactiveProducts: currentStats.inactiveProducts + Number(newStatus === "Inactive") - Number(currentStatus === "Inactive"),
        activeDeals: currentStats.activeDeals + (
          listing?.dealRequest?.status === "Approved" &&
            listing?.dealPrice && new Date(listing.dealExpiresAt) > new Date()
            ? Number(newStatus === "Available") - Number(currentStatus === "Available")
            : 0
        ),
      } : currentStats);
      toast.success("Listing visibility updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update listing");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${adminData.token}` } };
      const listing = listings.find((item) => item._id === id);
      await api.delete(`/admin/products/${id}`, config);

      setListings((current) => current.filter((item) => item._id !== id));
      setStats((currentStats) => currentStats ? {
        ...currentStats,
        totalProducts: Math.max(0, currentStats.totalProducts - 1),
        availableProducts: Math.max(0, currentStats.availableProducts - Number(listing?.status === "Available")),
        inactiveProducts: Math.max(0, currentStats.inactiveProducts - Number(listing?.status === "Inactive")),
      } : currentStats);
      toast.success("Listing deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete listing");
    }
  };

  const handleResolveReport = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminData.token}` } };
      await api.put(`/admin/reports/${id}/resolve`, {}, config);
      setReports(reports.map(r => r._id === id ? { ...r, status: "Resolved" } : r));
      setStats((currentStats) => currentStats ? {
        ...currentStats,
        pendingReports: Math.max(0, currentStats.pendingReports - 1),
      } : currentStats);
      toast.success("Report resolved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resolve report");
    }
  };

  const filteredUsers = users.filter(u => (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredListings = listings.filter(l => (l.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (l.seller?.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
  const configuredDeals = listings.filter((product) =>
    product.dealRequest?.status === "Approved" && product.dealPrice && product.dealExpiresAt
  );
  const activeDeals = configuredDeals.filter((product) =>
    product.status === "Available" && new Date(product.dealExpiresAt) > new Date()
  );

  const handleReviewDealRequest = async (product, decision) => {
    try {
      const response = await api.put(`/admin/deal-requests/${product._id}/review`, { decision });
      const wasAlreadyActive = activeDeals.some((deal) => deal._id === product._id);
      const isNowActive = decision === "approve" &&
        response.data.data.status === "Available" &&
        response.data.data.dealExpiresAt &&
        new Date(response.data.data.dealExpiresAt) > new Date();
      setListings((current) => current.map((product) =>
        product._id === response.data.data._id ? response.data.data : product
      ));
      setStats((current) => current ? {
        ...current,
        activeDeals: current.activeDeals + Number(isNowActive) - Number(wasAlreadyActive),
      } : current);
      setDealRequests((current) => current.filter((request) => request._id !== product._id));
      toast.success(decision === "approve" ? "Seller-approved deal is now live" : "Deal request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to review deal request");
    }
  };

  const handleRemoveDeal = async (productId) => {
    try {
      await api.delete(`/admin/products/${productId}/deal`);
      setListings((current) => current.map((product) =>
        product._id === productId
          ? {
              ...product,
              dealPrice: null,
              dealExpiresAt: null,
              dealRequest: product.dealRequest
                ? { ...product.dealRequest, status: "Ended" }
                : product.dealRequest,
            }
          : product
      ));
      if (activeDeals.some((deal) => deal._id === productId)) {
        setStats((current) => current ? {
          ...current,
          activeDeals: Math.max(0, current.activeDeals - 1),
        } : current);
      }
      toast.success("Deal removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove deal");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading admin panel...</div>;
  if (!adminData) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white pt-8 pb-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Control Panel</h1>
              <p className="mt-2 text-slate-400">Welcome back, {adminData.name}. Monitor and manage the CampConnect platform.</p>
            </div>
            <Link to="/" className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 -mt-8">

        {loadError && (
          <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <p>{loadError}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchAdminData(adminData.token);
              }}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm mb-8">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'users', icon: Users, label: 'Manage Users' },
            { id: 'listings', icon: Package, label: 'Manage Listings' },
            { id: 'deals', icon: Tag, label: `Deals (${dealRequests.length})` },
            { id: 'reports', icon: Flag, label: 'Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.totalUsers ?? users.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.totalProducts ?? listings.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Listings</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.availableProducts ?? listings.filter(l => l.status === "Available").length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Reports</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.pendingReports ?? reports.filter(r => r.status === "Pending").length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Deals</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.activeDeals ?? activeDeals.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Join Date</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' || !user.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {user._id !== adminData._id && (
                              <>
                                <button onClick={() => handleSuspendUser(user._id, user.status)} title={user.status === 'Suspended' ? 'Activate' : 'Suspend'} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition">
                                  {user.status === 'Suspended' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Ban className="h-4 w-4" />}
                                </button>
                                <button onClick={() => handleDeleteUser(user._id)} title="Delete" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          {searchQuery ? "No users match your search." : "No users found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LISTINGS TAB */}
          {activeTab === 'listings' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Listing Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search listings..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold">Seller</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredListings.map((listing) => (
                      <tr key={listing._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{listing.title}</td>
                        <td className="px-6 py-4">{listing.seller?.name || "Unknown"}</td>
                        <td className="px-6 py-4">₹{listing.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${listing.status === 'Available' || !listing.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                            {listing.status || 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {['Available', 'Inactive'].includes(listing.status || 'Available') && (
                              <button onClick={() => handleToggleListing(listing._id, listing.status || 'Available')} title={listing.status === 'Inactive' ? 'Show Listing' : 'Hide Listing'} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                                {listing.status === 'Inactive' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                            )}
                            <button onClick={() => handleDeleteListing(listing._id)} title="Delete Listing" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredListings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          {searchQuery ? "No listings match your search." : "No product listings found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LIMITED-TIME DEALS TAB */}
          {activeTab === 'deals' && (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Seller Requests ({dealRequests.length} pending)
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Approving publishes exactly the seller-approved price and end time.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Product</th>
                        <th className="px-6 py-4 font-semibold">Seller</th>
                        <th className="px-6 py-4 font-semibold">Regular Price</th>
                        <th className="px-6 py-4 font-semibold">Seller-Agreed Deal</th>
                        <th className="px-6 py-4 font-semibold">Requested At</th>
                        <th className="px-6 py-4 text-right font-semibold">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {dealRequests.map((product) => {
                        return (
                          <tr key={product._id}>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{product.title}</td>
                            <td className="px-6 py-4">{product.seller?.name || product.seller?.email || "Unknown seller"}</td>
                            <td className="px-6 py-4">₹{product.price}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-rose-600">₹{product.dealRequest.dealPrice}</span>
                              <span className="mt-1 block text-xs">
                                Ends {new Date(product.dealRequest.expiresAt).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">{new Date(product.dealRequest.requestedAt).toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleReviewDealRequest(product, "reject")}
                                className="mr-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewDealRequest(product, "approve")}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {dealRequests.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                            No pending seller requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Approved Deals ({activeDeals.length} active)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Product</th>
                        <th className="px-6 py-4 font-semibold">Seller</th>
                        <th className="px-6 py-4 font-semibold">Regular Price</th>
                        <th className="px-6 py-4 font-semibold">Agreed Price</th>
                        <th className="px-6 py-4 font-semibold">Ends At</th>
                        <th className="px-6 py-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {configuredDeals.map((deal) => {
                        const dealIsActive = deal.status === "Available" &&
                          new Date(deal.dealExpiresAt) > new Date();
                        return (
                          <tr key={deal._id}>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{deal.title}</td>
                            <td className="px-6 py-4">{deal.seller?.name || deal.seller?.email || "Unknown seller"}</td>
                            <td className="px-6 py-4">₹{deal.price}</td>
                            <td className="px-6 py-4 font-semibold text-rose-600">₹{deal.dealPrice}</td>
                            <td className="px-6 py-4">
                              <span className="block">{new Date(deal.dealExpiresAt).toLocaleString()}</span>
                              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${dealIsActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                {dealIsActive ? "Active" : "Expired"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {dealIsActive && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDeal(deal._id)}
                                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                  title="End deal"
                                  aria-label={`End deal for ${deal.title}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {configuredDeals.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                            No seller-approved deals yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Community Reports</h2>
                <p className="text-sm text-slate-500 mt-1">Review flagged content and users from the community.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Reported ID</th>
                      <th className="px-6 py-4 font-semibold">Reason</th>
                      <th className="px-6 py-4 font-semibold">Reported By</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${report.type === 'User' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{report.reportedId}</td>
                        <td className="px-6 py-4 text-red-600 font-medium">{report.reason}</td>
                        <td className="px-6 py-4">{report.by?.name || report.by}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${report.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                          {report.status === 'Pending' && (
                            <button onClick={() => handleResolveReport(report._id)} title="Mark as Resolved" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            title="View Details"
                            aria-label="View report details"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          No reports found. Great job!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
              onClick={() => setSelectedReport(null)}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-details-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 id="report-details-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Report Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Submitted {selectedReport.createdAt
                        ? new Date(selectedReport.createdAt).toLocaleString()
                        : "date unavailable"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    aria-label="Close report details"
                    className="rounded-lg px-3 py-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>

                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Type</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{selectedReport.type}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Reported ID</dt>
                    <dd className="mt-1 break-all font-mono text-slate-900 dark:text-slate-100">
                      {selectedReport.reportedId}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Reason</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{selectedReport.reason}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Additional details</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                      {selectedReport.details?.trim() || "No additional details were provided."}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Reported by</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">
                      {selectedReport.by?.name || "Unknown"}
                      {selectedReport.by?.email ? ` (${selectedReport.by.email})` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Status</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{selectedReport.status}</dd>
                  </div>
                </dl>
              </section>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboard;
