import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storeAuthSession } from '../../services/api';

function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleAuth = () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (!token || !userParam) {
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Store user data and token in localStorage
        storeAuthSession(userData, token);

        toast.success(`Welcome, ${userData.name}!`);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Google auth error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-600 dark:text-slate-400">Completing Google authentication...</p>
      </div>
    </div>
  );
}

export default GoogleSuccess;
