import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useProject } from "../hooks/useProject";
import { 
  IoFolderOpen, 
  IoAddCircle, 
  IoArrowBack,
  IoCalendar,
  IoPeople,
  IoEye,
  IoCreate
} from "react-icons/io5";
import { useTheme } from "../contexts/ThemeContext";

const Projects = () => {
  const { projects, loading } = useProject();
  const navigate = useNavigate();
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
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: { light: 'bg-green-100 text-green-800 border-green-200', dark: 'bg-green-900/30 text-green-300 border-green-700' },
      completed: { light: 'bg-blue-100 text-blue-800 border-blue-200', dark: 'bg-blue-900/30 text-blue-300 border-blue-700' },
      planning: { light: 'bg-yellow-100 text-yellow-800 border-yellow-200', dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
      'on-hold': { light: 'bg-orange-100 text-orange-800 border-orange-200', dark: 'bg-orange-900/30 text-orange-300 border-orange-700' }
    };
    return colors[status] || { light: 'bg-gray-100 text-gray-800 border-gray-200', dark: 'bg-gray-900/30 text-gray-300 border-gray-700' };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-6"
    >
      {/* Page Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/dashboard"
              className={`inline-flex items-center font-medium mb-4 transition-colors ${
                isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
              }`}
            >
              <IoArrowBack className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Projects
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage your projects and track progress
          </motion.p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/dashboard/projects/new"
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            }`}
          >
            <IoAddCircle className="w-5 h-5 mr-2" />
            New Project
          </Link>
        </motion.div>
      </motion.div>

      {/* Projects Grid */}
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`rounded-full h-12 w-12 border-b-2 ${
                isDarkMode ? "border-blue-500" : "border-amber-600"
              }`}
            />
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
                className={`rounded-2xl shadow-xl border backdrop-blur-sm overflow-hidden ${
                  isDarkMode 
                    ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700/80" 
                    : "bg-white/80 border-amber-200 hover:bg-white"
                }`}
              >
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isDarkMode 
                            ? "bg-gradient-to-br from-blue-600 to-purple-600" 
                            : "bg-gradient-to-br from-amber-500 to-amber-600"
                        }`}
                      >
                        <IoFolderOpen className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {project.name}
                        </h3>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${
                        isDarkMode 
                          ? getStatusColor(project.status).dark 
                          : getStatusColor(project.status).light
                      }`}
                    >
                      {project.status}
                    </motion.span>
                  </div>

                  {/* Project Description */}
                  <p className={`text-sm mb-6 line-clamp-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className={`space-y-3 text-sm mb-6 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <IoCalendar className="w-4 h-4 mr-2" />
                        Start Date
                      </span>
                      <span className={`font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}>
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <IoCalendar className="w-4 h-4 mr-2" />
                        End Date
                      </span>
                      <span className={`font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}>
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <IoPeople className="w-4 h-4 mr-2" />
                        Team Members
                      </span>
                      <span className={`font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-900"
                      }`}>
                        {project.teamMembers?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                      className={`flex-1 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                        isDarkMode 
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                    >
                      <IoEye className="w-4 h-4 mr-2" />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/dashboard/projects/${project._id}/edit`)}
                      className={`flex-1 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                        isDarkMode 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <IoCreate className="w-4 h-4 mr-2" />
                      Edit
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State */}
            <AnimatePresence>
              {projects.length === 0 && (
                <motion.div
                  variants={emptyStateVariants}
                  initial="hidden"
                  animate="visible"
                  className="col-span-full text-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-6xl mb-6"
                  >
                    📁
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-2xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No projects yet
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-lg mb-6 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Create your first project to get started
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/dashboard/projects/new"
                      className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 inline-flex items-center shadow-lg ${
                        isDarkMode 
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                          : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                      }`}
                    >
                      <IoAddCircle className="w-5 h-5 mr-2" />
                      Create Your First Project
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects;