import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import api from "../../services/api";

function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const clientOrigin = window.location.origin;
      // Get Google OAuth URL from backend with client_url
      const response = await api.get("/auth/google/url", {
        params: { client_url: clientOrigin },
      });
      
      if (response.data.success) {
        // Redirect to Google OAuth URL
        window.location.href = response.data.data.authURL;
      } else {
        setError("Failed to initialize Google login");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to connect to authentication server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle className="h-5 w-5" />
        <span>{loading ? "Connecting..." : "Continue with Google"}</span>
      </button>

      <div className="text-center text-xs text-slate-500">
        <p>Note: Only college emails (e.g., @giet.edu) are allowed</p>
      </div>
    </div>
  );
}

export default GoogleLoginButton;