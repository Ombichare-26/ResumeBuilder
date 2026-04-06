import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload as UploadIcon, BarChart3, Map, LogOut } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Resume', icon: UploadIcon },
    { path: '/analysis', label: 'Analysis', icon: BarChart3 },
    { path: '/roadmap', label: 'Roadmap', icon: Map },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/auth';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-slate-800 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-y-2 flex-col">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <span className="text-2xl font-bold">RB</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Resume<span className="text-indigo-400">Builder</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
