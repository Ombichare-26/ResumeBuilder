import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="text-indigo-500 animate-spin" size={48} />
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
