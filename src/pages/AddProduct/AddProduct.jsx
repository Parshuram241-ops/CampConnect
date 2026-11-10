import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Camera, Plus } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import toast from "react-hot-toast";
import { createProduct } from "../../services/api";

const categories = [
  "Books",
  "Electronics",
  "Study Materials",
  "Furniture",
  "Hostel Essentials",
  "Lab Equipment",
  "Clothing",
  "Sports & Fitness",
  "Others",
];

const conditions = ["Brand New", "Like New", "Excellent", "Good", "Fair", "Used"];

const listingTypes = ["For Sale", "For Rent", "Exchange", "Free"];

const locations = [
  "Boys Hostel",
  "Girls Hostel",
  "Hostel Block A",
  "Hostel Block B",
  "Hostel Block C",
  "CSE Block",
  "IT Department",
  "Science Block",
  "Library",
  "Main Campus",
  "Other",
];

function AddProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    listingType: "For Sale",
    price: "",
    location: "",
    contactNumber: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (imagePreviews.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, file],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.condition) {
      newErrors.condition = "Please select product condition";
    }

    if (formData.listingType !== "Free" && !formData.price) {
      newErrors.price = "Price is required";
    } else if (formData.price && isNaN(formData.price)) {
      newErrors.price = "Price must be a valid number";
    }

    if (!formData.location) {
      newErrors.location = "Please select your location";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Please enter a valid 10-digit number";
    }

    if (imagePreviews.length === 0) {
      newErrors.images = "Please upload at least one image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare product data for API
      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        type: formData.listingType,
        price: formData.listingType === 'Free' ? 0 : parseFloat(formData.price),
        images: imagePreviews, // Send base64 images
        location: formData.location,
        contactNumber: formData.contactNumber,
        negotiable: true,
      };

      // Call API to create product
      await createProduct(productData);

      toast.success("Product listed successfully! 🎉");
      
      // Navigate to marketplace
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/marketplace");
      }, 1000);
    } catch (error) {
      console.error("Error adding product:", error);
      const errorMessage = error.response?.data?.message || "Failed to list product. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-800 py-8">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">List Your Product</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Fill in the details below to list your product on CampConnect marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Product Images</h2>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Upload up to 5 images. First image will be the cover photo.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                {imagePreviews.length < 5 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800 transition hover:border-blue-500 hover:bg-blue-50">
                    <Camera className="mb-2 h-8 w-8 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600">{errors.images}</p>
              )}
            </div>

            {/* Product Details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Product Details</h2>

              <div className="space-y-5">
                
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Engineering Mathematics Textbook"
                    className={`w-full rounded-lg border ${
                      errors.title ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    } px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your product in detail. Include brand, model, year of purchase, reason for selling, etc."
                    className={`w-full rounded-lg border ${
                      errors.description ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    } px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    {errors.description ? (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {formData.description.length} characters (minimum 20)
                      </p>
                    )}
                  </div>
                </div>

                {/* Category and Condition */}
                <div className="grid gap-5 md:grid-cols-2">
                  
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border ${
                        errors.category ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border ${
                        errors.condition ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">Select condition</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                    {errors.condition && (
                      <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                    )}
                  </div>
                </div>

                {/* Listing Type and Price */}
                <div className="grid gap-5 md:grid-cols-2">
                  
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Listing Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {listingTypes.map((type) => (
                        <label
                          key={type}
                          className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                            formData.listingType === type
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="listingType"
                            value={type}
                            checked={formData.listingType === type}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Price {formData.listingType !== "Free" && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        disabled={formData.listingType === "Free"}
                        placeholder={formData.listingType === "Free" ? "Free" : "Enter price"}
                        className={`w-full rounded-lg border ${
                          errors.price ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                        } py-3 pl-8 pr-4 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 dark:bg-slate-800`}
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                    {formData.listingType === "For Rent" && (
                      <p className="mt-1 text-xs text-slate-500">Price per day/week/month</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Contact Information</h2>

              <div className="space-y-5">
                
                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      errors.location ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    } px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="">Select your location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit mobile number"
                    className={`w-full rounded-lg border ${
                      errors.contactNumber ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    } px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    This number will be visible to interested buyers
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Listing Product...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>List Product</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-8 py-4 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default AddProduct;
