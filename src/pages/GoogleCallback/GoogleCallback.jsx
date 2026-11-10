import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // This component is no longer needed since Google OAuth redirects directly to verify-otp
    // Redirect to login if someone lands here by mistake
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-700 dark:text-slate-300 font-medium">Redirecting...</p>
      </div>
    </div>
  );
}

export default GoogleCallback;