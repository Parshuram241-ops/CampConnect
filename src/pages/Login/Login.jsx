import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import api, { storeAuthSession } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      toast.error("Your session expired. Please log in again.");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("session");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    console.log('🔐 Login attempt:', { email: formData.email, password: '***' });

    try {
      // Call backend API
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('✅ Response received:', response.status);
      
      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store user data with token
        storeAuthSession(user, token);

        console.log('✅ Login successful, redirecting to dashboard');
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Response:', error.response);
      console.error('Request:', error.config);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server is taking too long to respond';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server on port 5000';
      } else if (error.message.includes('Network Error') || !error.response) {
        errorMessage = 'Unable to connect to server. Backend might be down.';
      } else if (error.message.includes('ERR_NETWORK')) {
        errorMessage = 'Network error: Cannot reach backend server';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">

      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            CampConnect
          </Link>

          <Link
            to="/register"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600"
          >
            Create Account
          </Link>

        </div>
      </nav>


      {/* Login */}
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xl shadow-slate-200/40">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LogIn className="h-7 w-7" />
            </div>


            <div className="mt-6 text-center">

              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Login to your CampConnect account
              </p>

            </div>


            {/* Error */}
            {error && (
              <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                <div className="font-semibold mb-2">Error:</div>
                <div>{error}</div>
                <div className="mt-2 text-xs text-red-500">
                  📌 Check browser console (F12) for more details
                </div>
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>

                </div>

              </div>


              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>

            </form>


            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              {/* Google Login */}
              <div className="mt-6">
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      try {
                        const clientOrigin = window.location.origin;
                        const response = await api.get('/auth/google/url', {
                          params: { client_url: clientOrigin },
                        });
                        const data = response.data;
                        if (data.success) {
                          window.location.href = data.data.authURL;
                        }
                      } catch (error) {
                        console.error('Google login error:', error);
                        setError('Failed to connect to authentication server');
                      }
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  
                  <div className="text-center text-xs text-slate-500">
                    <p>Note: Only college emails (e.g., @giet.edu) are allowed</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Login;
