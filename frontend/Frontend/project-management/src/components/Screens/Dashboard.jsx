import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "../../layout/Header";
import Sidebar from "../../layout/Sidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-shrink-0 overflow-hidden"
      >
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className={`flex-1 overflow-auto transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
          <div className="container mx-auto p-6">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: isDarkMode ? '#1f2937' : '#374151',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;