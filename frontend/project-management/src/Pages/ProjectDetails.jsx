import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from '../contexts/ThemeContext';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoPeople, 
  IoDocumentText,
  IoAddCircle,
  IoRocket,
  IoPricetag,
  IoBusiness,
  IoFlag,
  IoTime,
  IoStatsChart,
  IoEllipsisVertical,
  IoCreate,
  IoTrash,
  IoEye,
  IoCheckmarkCircle
} from "react-icons/io5";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
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
      y: -2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const taskItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      scale: 1.01,
      x: 5,
      transition: {
        duration: 0.2
      }
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Fetch project data
        const projectResponse = await axios.get(`https://project-pilot-4ju2.onrender.com/api/projects/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProject(projectResponse.data);

        // Fetch tasks for this project separately
        try {
          const tasksResponse = await axios.get(`https://project-pilot-4ju2.onrender.com/api/tasks/project/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setTasks(tasksResponse.data);
        } catch (tasksError) {
          console.log('⚠️ No tasks found or tasks endpoint not available');
          setTasks([]);
        }
        
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.response?.data?.error || 'Failed to fetch project');
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id]);

  // Calculate project statistics
  const projectStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
    todoTasks: tasks.filter(task => task.status === 'todo').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0
  };

  const getStatusColor = (status) => {
    const colors = {
      active: { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-100 text-green-800', dark: 'bg-green-900/30 text-green-300 border-green-700' },
      completed: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-900/30 text-blue-300 border-blue-700' },
      planning: { bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-100 text-yellow-800', dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
      'on-hold': { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 text-orange-800', dark: 'bg-orange-900/30 text-orange-300 border-orange-700' }
    };
    return colors[status] || { bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-100 text-gray-800', dark: 'bg-gray-900/30 text-gray-300 border-gray-700' };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: { light: 'bg-red-100 text-red-800 border-red-300', dark: 'bg-red-900/30 text-red-300 border-red-700' },
      medium: { light: 'bg-yellow-100 text-yellow-800 border-yellow-300', dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
      low: { light: 'bg-green-100 text-green-800 border-green-300', dark: 'bg-green-900/30 text-green-300 border-green-700' },
      urgent: { light: 'bg-purple-100 text-purple-800 border-purple-300', dark: 'bg-purple-900/30 text-purple-300 border-purple-700' }
    };
    return colors[priority] || colors.medium;
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      completed: { light: 'bg-green-100 text-green-800 border-green-300', dark: 'bg-green-900/30 text-green-300 border-green-700' },
      'in-progress': { light: 'bg-blue-100 text-blue-800 border-blue-300', dark: 'bg-blue-900/30 text-blue-300 border-blue-700' },
      review: { light: 'bg-yellow-100 text-yellow-800 border-yellow-300', dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
      todo: { light: 'bg-gray-100 text-gray-800 border-gray-300', dark: 'bg-gray-900/30 text-gray-300 border-gray-700' }
    };
    return colors[status] || colors.todo;
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://project-pilot-4ju2.onrender.com/api/projects/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        navigate('/dashboard/projects');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-12 w-12 border-b-2 ${isDarkMode ? "border-blue-500" : "border-amber-600"}`}
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#FFF6E0] text-gray-900"}`}
      >
        <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/dashboard/projects" 
            className={`inline-flex items-center font-medium mb-4 transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Projects
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-6 ${
            isDarkMode ? "bg-red-900/20 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <p>Error: {error}</p>
        </motion.div>
      </motion.div>
    );
  }

  if (!project) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#FFF6E0] text-gray-900"}`}>
        <Link 
          to="/dashboard/projects" 
          className={`inline-flex items-center font-medium mb-4 ${
            isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
          }`}
        >
          ← Back to Projects
        </Link>
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen p-6 space-y-8 ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}
    >
      
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/dashboard/projects" 
            className={`inline-flex items-center font-medium transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Projects
          </Link>
        </motion.div>

        {/* Actions Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode 
                ? "hover:bg-gray-700 text-gray-300" 
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <IoEllipsisVertical className="w-6 h-6" />
          </motion.button>

          <AnimatePresence>
            {showActionsMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className={`absolute right-0 top-12 w-48 rounded-xl shadow-xl border backdrop-blur-sm z-10 ${
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700" 
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="p-2">
                  <motion.button
                    whileHover={{ backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                    onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    <IoCreate className="w-4 h-4 mr-2" />
                    Edit Project
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
                    onClick={handleDeleteProject}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    <IoTrash className="w-4 h-4 mr-2" />
                    Delete Project
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Project Header */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
          isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {project.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {project.description}
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize border backdrop-blur-sm ${
                isDarkMode 
                  ? getStatusColor(project.status).dark 
                  : getStatusColor(project.status).light
              }`}
            >
              {project.status.replace('-', ' ')}
            </motion.span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center ${
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

        {/* Project Stats */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: IoDocumentText, label: "Total Tasks", value: projectStats.totalTasks, color: "blue" },
            { icon: IoCheckmarkCircle, label: "Completed", value: projectStats.completedTasks, color: "green" },
            { icon: IoTime, label: "In Progress", value: projectStats.inProgressTasks, color: "yellow" },
            { icon: IoStatsChart, label: "Completion", value: `${projectStats.completionRate}%`, color: "purple" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover="hover"
              className={`rounded-xl p-6 border-2 backdrop-blur-sm ${
                isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${
                    stat.color === 'blue' ? (isDarkMode ? "text-blue-400" : "text-blue-600") :
                    stat.color === 'green' ? (isDarkMode ? "text-green-400" : "text-green-600") :
                    stat.color === 'yellow' ? (isDarkMode ? "text-yellow-400" : "text-yellow-600") :
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode ? "bg-gray-600/50 text-gray-300" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <stat.icon className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Project Details Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: IoCalendar, label: "Start Date", value: new Date(project.startDate).toLocaleDateString() },
            { icon: IoCalendar, label: "End Date", value: new Date(project.endDate).toLocaleDateString() },
            { icon: IoPeople, label: "Team Members", value: project.teamMembers?.length || 0 },
            { icon: IoFlag, label: "Priority", value: project.priority, isPriority: true }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover="hover"
              className={`rounded-xl p-6 border-2 backdrop-blur-sm ${
                isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {item.label}
                  </p>
                  {item.isPriority ? (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${
                        isDarkMode 
                          ? getPriorityColor(item.value).dark 
                          : getPriorityColor(item.value).light
                      }`}
                    >
                      {item.value}
                    </motion.span>
                  ) : (
                    <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {item.value}
                    </p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode ? "bg-gray-600/50 text-gray-300" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Tasks Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
          isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Project Tasks ({tasks.length})
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard/tasks/new", { state: { projectId: id } })}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            }`}
          >
            <IoAddCircle className="w-5 h-5 mr-2" />
            Add New Task
          </motion.button>
        </div>
        
        <AnimatePresence>
          {tasks.length > 0 ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  variants={taskItemVariants}
                  whileHover="hover"
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all group ${
                    isDarkMode 
                      ? "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className={`font-semibold text-lg group-hover:underline ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${
                              isDarkMode 
                                ? getTaskStatusColor(task.status).dark 
                                : getTaskStatusColor(task.status).light
                            }`}
                          >
                            {task.status.replace('-', ' ')}
                          </motion.span>
                          {task.priority && (
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${
                                isDarkMode 
                                  ? getPriorityColor(task.priority).dark 
                                  : getPriorityColor(task.priority).light
                              }`}
                            >
                              {task.priority}
                            </motion.span>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {task.description}
                        </p>
                      )}
                      <div className={`flex items-center space-x-6 text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {task.assignedTo && (
                          <span className="flex items-center">
                            <IoPeople className="w-4 h-4 mr-2" />
                            {task.assignedTo.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center">
                            <IoCalendar className="w-4 h-4 mr-2" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.estimatedHours && (
                          <span className="flex items-center">
                            <IoTime className="w-4 h-4 mr-2" />
                            {task.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
                      className={`ml-4 p-2 rounded-xl transition-colors ${
                        isDarkMode 
                          ? "bg-gray-600 text-gray-300 hover:bg-gray-500" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <IoEye className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📝</div>
              <p className={`text-lg mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                No tasks yet for this project
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard/tasks/new", { state: { projectId: id } })}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                    : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                }`}
              >
                Add First Task
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Additional Project Info Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
          isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
        }`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Project Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Client */}
          {project.client && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center mb-3">
                <IoBusiness className={`w-5 h-5 mr-3 ${isDarkMode ? "text-green-400" : "text-green-500"}`} />
                <h3 className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Client
                </h3>
              </div>
              <p className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {project.client}
              </p>
            </motion.div>
          )}

          {/* Budget */}
          {project.budget && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center mb-3">
                <IoPricetag className={`w-5 h-5 mr-3 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />
                <h3 className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Budget
                </h3>
              </div>
              <p className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                ${project.budget.toLocaleString()}
              </p>
            </motion.div>
          )}

          {/* Team */}
          {project.team && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center mb-3">
                <IoPeople className={`w-5 h-5 mr-3 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`} />
                <h3 className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Team
                </h3>
              </div>
              <p className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {project.team.name}
              </p>
            </motion.div>
          )}

          {/* Progress */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 ${isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center mb-3">
              <IoStatsChart className={`w-5 h-5 mr-3 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
              <h3 className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Progress
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Completion</span>
                <span className={`font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                  {projectStats.completionRate}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${projectStats.completionRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    isDarkMode ? "bg-blue-500" : "bg-blue-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetails;