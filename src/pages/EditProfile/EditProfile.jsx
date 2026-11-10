import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfile } from "../../services/api";

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [originalUser] = useState(() => {
    try {
      const userData = localStorage.getItem("campconnectUser");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error loading user data:", e);
      return null;
    }
  });

  const [formData, setFormData] = useState(() => ({
    name: originalUser?.name || "",
    email: originalUser?.email || "",
    phone: originalUser?.phone || "",
    department: originalUser?.department || "",
    year: originalUser?.year || "",
    hostel: originalUser?.hostel || "",
    bio: originalUser?.bio || "",
    avatar: originalUser?.avatar || "",
  }));

  const [photoPreview, setPhotoPreview] = useState(() => originalUser?.avatar || "");

  // Redirect if not logged in
  useEffect(() => {
    if (!originalUser) {
      navigate("/login");
    }
  }, [originalUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      setLoading(false);
      return;
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits");
      setLoading(false);
      return;
    }

    if (formData.bio && formData.bio.length > 500) {
      setError("Bio cannot exceed 500 characters");
      setLoading(false);
      return;
    }

    try {
      // API Call to update backend
      const response = await updateProfile(formData);
      
      // Update user data in localStorage with the returned updated user
      const updatedUser = {
        ...originalUser,
        ...response.data.user,
      };

      localStorage.setItem("campconnectUser", JSON.stringify(updatedUser));
      
      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const departments = [
    "CSE",
    "ECE",
    "Mechanical",
    "Civil",
    "Biotechnology",
    "IT",
    "EEE",
    "Chemical",
    "Physics",
    "Mathematics",
    "Other",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 py-12 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl shadow-slate-200/40">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit Profile</h1>
            <p className="mt-2 text-sm text-slate-500">Update your personal information</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 flex items-start gap-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Section */}
            <div>
              <label className="mb-4 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Profile Photo
              </label>

              <div className="flex items-center gap-6">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-24 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <>
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Camera className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 font-medium text-blue-600 hover:bg-blue-100">
                    <Camera className="h-5 w-5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-slate-500">
                    Max 5MB. Supported: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Basic Information</h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Academic Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Department */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Year</option>
                    {years.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hostel */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hostel
                </label>
                <input
                  type="text"
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleInputChange}
                  placeholder="e.g., Boys Hostel A, Girls Hostel B"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself (max 500 characters)"
                rows="4"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 bg-white dark:bg-slate-800 py-3 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;