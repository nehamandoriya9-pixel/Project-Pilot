import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/Theme/ThemeToggle';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const avatarVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const buttonVariants = {
    initial: { 
      backgroundColor: isDarkMode ? '#4f46e5' : '#6366f1'
    },
    hover: { 
      backgroundColor: isDarkMode ? '#dc2626' : '#dc2626',
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-colors duration-300 ${
        isDarkMode 
          ? "bg-gray-950 border-gray-700/50" 
          : "bg-white border-r border-gray-200 text-gray-800"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Logo/Brand */}
          <div className="flex items-center space-x-4">
            {/* <motion.div 
              variants={avatarVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white" 
                  : "bg-gradient-to-br from-indigo-500 to-blue-500 text-white"
              }`}
            >
              <span className="text-lg font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </motion.div> */}
            
            <div className="hidden md:block">
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {user?.name}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Welcome back
              </motion.p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* User Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right border-r pr-4 border-gray-300 dark:border-gray-600">
                <p className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {user?.name}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  {user?.email}
                </p>
              </div>
              
              <motion.button 
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={handleLogout}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                  isDarkMode 
                    ? "text-white" 
                    : "text-white"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </span>
              </motion.button>
            </div>

            {/* Mobile User Menu */}
            <div className="lg:hidden relative">
              <motion.button
                variants={avatarVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  isDarkMode 
                    ? "bg-indigo-600 text-white" 
                    : "bg-indigo-500 text-white"
                }`}
              >
                <span className="text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    variants={menuVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className={`absolute right-0 top-12 mt-2 w-48 rounded-xl shadow-xl border backdrop-blur-lg ${
                      isDarkMode 
                        ? "bg-gray-800/90 border-gray-700" 
                        : "bg-white/90 border-gray-200"
                    }`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {user?.name}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {user?.email}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.1)' }}
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-3 text-sm font-medium ${
                        isDarkMode ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;