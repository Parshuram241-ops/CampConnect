import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getProductById, updateProduct } from "../../utils/productData";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialProduct = getProductById(id);

  const [formData, setFormData] = useState(() => {
    if (!initialProduct) {
      return {
        title: "",
        price: "",
        category: "",
        condition: "",
        description: "",
        type: "",
        quantity: 1,
        negotiable: false,
        location: "",
        tags: "",
      };
    }
    return {
      title: initialProduct.title || "",
      price: initialProduct.price || "",
      category: initialProduct.category || "",
      condition: initialProduct.condition || "",
      description: initialProduct.description || "",
      type: initialProduct.type || "",
      quantity: initialProduct.quantity || 1,
      negotiable: initialProduct.negotiable || false,
      location: initialProduct.location || "",
      tags: Array.isArray(initialProduct.tags) ? initialProduct.tags.join(", ") : "",
    };
  });

  useEffect(() => {
    if (!initialProduct) {
      toast.error("Product not found");
      navigate("/dashboard");
    }
  }, [initialProduct, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a product title");
      return;
    }

    if (!formData.price || formData.price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    // Prepare updated data
    const updatedData = {
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      condition: formData.condition,
      description: formData.description.trim(),
      type: formData.type,
      quantity: parseInt(formData.quantity),
      negotiable: formData.negotiable,
      location: formData.location.trim(),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
    };

    // Update product
    const result = updateProduct(id, updatedData);

    if (result) {
      toast.success("Product updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } else {
      toast.error("Failed to update product");
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (!initialProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            CampConnect
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit Product</h1>
          <p className="mt-2 text-slate-500">
            Update your listing details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
          
          {/* Product Title & Category */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Engineering Mathematics"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">Select Category</option>
                <option value="books">Books</option>
                <option value="electronics">Electronics</option>
                <option value="study-materials">Study Materials</option>
                <option value="furniture">Furniture</option>
                <option value="hostel-essentials">Hostel Essentials</option>
                <option value="lab-equipment">Lab Equipment</option>
                <option value="clothing">Clothing</option>
                <option value="sports">Sports</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          {/* Price & Condition */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="450"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Type & Quantity */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">Select Type</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="For Borrow">For Borrow</option>
                <option value="For Exchange">For Exchange</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Boys Hostel A"
            />
          </div>

          {/* Negotiable Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Price is negotiable
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Describe your product..."
            ></textarea>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label
              htmlFor="tags"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., textbook, engineering, academics"
            />
            <p className="mt-2 text-xs text-slate-500">
              Separate tags with commas
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white dark:bg-slate-800 px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>

            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}

export default EditProduct;
