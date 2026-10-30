import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, Menu, X, LayoutDashboard, Sparkles, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-primary-900 to-primary-700 bg-clip-text text-transparent">
                ResearchHub
              </span>
              <span className="px-1.5 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-md border border-primary-200/60">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="h-5 w-px bg-gray-200" />

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2.5 bg-gray-50 border border-gray-200/80 rounded-full py-1 px-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-800 max-w-[140px] truncate">
                      {user.full_name || user.email}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-500/20 transition-all hover:shadow"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started Free</span>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-2 px-1 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                <LayoutDashboard className="w-5 h-5 text-primary-600" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-base font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-base font-medium text-white bg-primary-600 rounded-lg shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

