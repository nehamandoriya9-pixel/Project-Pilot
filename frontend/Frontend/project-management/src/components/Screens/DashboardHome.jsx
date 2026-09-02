import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useDashboard from '../../hooks/useDashboard';
import { MdInsertDriveFile, MdTaskAlt } from 'react-icons/md';
import { BiTask } from 'react-icons/bi';
import { RiProgress7Line, RiTeamFill } from 'react-icons/ri';
import { IoAddCircle, IoRocket } from 'react-icons/io5';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardHome = () => {
  const { stats, recentProjects, loading } = useDashboard();
  const { isDarkMode } = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const statIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-12 w-12 border-b-2 ${isDarkMode ? "border-amber-500" : "border-amber-600"}`}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen space-y-8 p-6 ${isDarkMode ? "bg-gray-950" : "bg-[#FFF6E0]"}`}
    >
      
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className={`rounded-2xl p-8 shadow-lg border ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" 
            : "bg-gradient-to-br from-white to-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl font-bold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to Your Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-lg ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Here's what's happening with your projects today.
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isDarkMode 
                ? "bg-gradient-to-br from-amber-600 to-orange-600" 
                : "bg-gradient-to-br from-amber-500 to-amber-600"
            }`}
          >
            <IoRocket className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Projects */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className={`rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? "bg-gray-800/80 border-gray-700" 
              : "bg-white/80 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Total Projects
              </p>
              <motion.p 
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                {stats.totalProjects}
              </motion.p>
            </div>
            <motion.div
              variants={statIconVariants}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDarkMode 
                  ? "bg-amber-900/30 text-amber-400" 
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              <MdInsertDriveFile className="h-6 w-6" />
            </motion.div>
          </div>
        </motion.div>

        {/* Total Tasks */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className={`rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? "bg-gray-800/80 border-gray-700" 
              : "bg-white/80 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Total Tasks
              </p>
              <motion.p 
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              >
                {stats.totalTasks}
              </motion.p>
            </div>
            <motion.div
              variants={statIconVariants}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDarkMode 
                  ? "bg-blue-900/30 text-blue-400" 
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <BiTask className="h-6 w-6" />
            </motion.div>
          </div>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className={`rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? "bg-gray-800/80 border-gray-700" 
              : "bg-white/80 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Completed
              </p>
              <motion.p 
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
              >
                {stats.completedTasks}
              </motion.p>
            </div>
            <motion.div
              variants={statIconVariants}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDarkMode 
                  ? "bg-green-900/30 text-green-400" 
                  : "bg-green-100 text-green-600"
              }`}
            >
              <MdTaskAlt className="h-6 w-6" />
            </motion.div>
          </div>
        </motion.div>

        {/* In Progress Tasks */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className={`rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? "bg-gray-800/80 border-gray-700" 
              : "bg-white/80 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                In Progress
              </p>
              <motion.p 
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
              >
                {stats.inProgressTasks}
              </motion.p>
            </div>
            <motion.div
              variants={statIconVariants}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDarkMode 
                  ? "bg-orange-900/30 text-orange-400" 
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              <RiProgress7Line className="h-6 w-6" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Recent Projects */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? "bg-gray-800/80 border-gray-700" 
              : "bg-white/80 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Recent Projects
            </h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/dashboard/projects" 
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                View All
              </Link>
            </motion.div>
          </div>
          <div className="space-y-4">
            {recentProjects.slice(0, 3).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isDarkMode 
                    ? "bg-gray-700/50 border-gray-600" 
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {project.name}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {project.status}
                  </p>
                </div>
                <div className="text-right">
                  <motion.p 
                    className={`text-lg font-bold ${
                      isDarkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {project.progress}%
                  </motion.p>
                  <p className={`text-xs ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Progress
                  </p>
                </div>
              </motion.div>
            ))}
            {recentProjects.length === 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-8 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No projects yet. Create your first project!
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${
            isDarkMode 
              ? "bg-gray-800/80 border-gray-700" 
              : "bg-white/80 border-amber-200"
          }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Quick Actions
          </h2>
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/dashboard/projects/new"
                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                  isDarkMode 
                    ? "bg-gray-700/50 border-gray-600 hover:bg-gray-600" 
                    : "bg-amber-50 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-amber-600 to-orange-600" 
                      : "bg-gradient-to-br from-amber-500 to-amber-600"
                  }`}
                >
                  <IoAddCircle className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Create New Project
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Start a new project
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/dashboard/tasks/new"
                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                  isDarkMode 
                    ? "bg-gray-700/50 border-gray-600 hover:bg-gray-600" 
                    : "bg-amber-50 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600" 
                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                  }`}
                >
                  <BiTask className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Add New Task
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Create a new task
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/dashboard/team"
                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                  isDarkMode 
                    ? "bg-gray-700/50 border-gray-600 hover:bg-gray-600" 
                    : "bg-amber-50 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-purple-600 to-pink-600" 
                      : "bg-gradient-to-br from-purple-500 to-purple-600"
                  }`}
                >
                  <RiTeamFill className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Invite Team
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Add team members
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;