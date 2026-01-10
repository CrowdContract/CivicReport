import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { motion } from "framer-motion";
import { 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Menu,
  X
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const ModernNav = () => {
  const [auth, setAuth] = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard", protected: true },
    { name: "Reports", href: "/reports", protected: true },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="CivicReport" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }} />
          <span>CivicReport</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-menu">
          {navLinks.map((link) => {
            if (link.protected && !auth.user) return null;
            return (
              <li key={link.name}>
                <Link 
                  to={link.href} 
                  className="nav-link"
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <ThemeToggle />

          {auth.user ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ 
                    backgroundColor: showUserMenu ? 'var(--bg-tertiary)' : 'transparent',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {auth.user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {auth.user.email?.split('@')[0]}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-2 z-50"
                    style={{ 
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {auth.user.email}
                      </p>
                      <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {auth.user.role}
                      </p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    
                    <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-nav btn-nav-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav btn-nav-primary">
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t"
          style={{ 
            background: 'var(--bg-primary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              if (link.protected && !auth.user) return null;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {!auth.user && (
              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 border rounded-lg transition-colors"
                  style={{ 
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default ModernNav;