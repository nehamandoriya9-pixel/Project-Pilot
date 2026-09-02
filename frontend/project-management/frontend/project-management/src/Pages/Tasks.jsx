import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTask } from "../hooks/useTask";
import { 
  IoCheckmarkCircle, 
  IoTime, 
  IoWarning, 
  IoList, 
  IoAddCircle,
  IoFilter,
  IoCalendar,
  IoPerson,
  IoRocket,
  IoStatsChart,
  IoEye,
  IoCreate
} from 'react-icons/io5';
import { useTheme } from '../contexts/ThemeContext';

const Tasks = () => {
  const { tasks, loading } = useTask();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
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

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 'todo';
    if (filter === 'in-progress') return task.status === 'in-progress';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') return new Date(task.dueDate) < new Date() && task.status !== 'completed';
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === 'status') {
      const statusOrder = { 'todo': 1, 'in-progress': 2, 'review': 3, 'completed': 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return 0;
  });

  // Get status icon and color
  const getStatusInfo = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'completed';
    
    if (isOverdue) {
      return { 
        icon: IoWarning, 
        color: 'text-red-500', 
        bgColor: 'bg-red-100', 
        darkBgColor: 'bg-red-900/30',
        label: 'Overdue' 
      };
    }
    
    switch (status) {
      case 'completed':
        return { 
          icon: IoCheckmarkCircle, 
          color: 'text-green-500', 
          bgColor: 'bg-green-100',
          darkBgColor: 'bg-green-900/30',
          label: 'Completed' 
        };
      case 'in-progress':
        return { 
          icon: IoTime, 
          color: 'text-blue-500', 
          bgColor: 'bg-blue-100',
          darkBgColor: 'bg-blue-900/30',
          label: 'In Progress' 
        };
      case 'review':
        return { 
          icon: IoWarning, 
          color: 'text-yellow-500', 
          bgColor: 'bg-yellow-100',
          darkBgColor: 'bg-yellow-900/30',
          label: 'Review' 
        };
      default:
        return { 
          icon: IoList, 
          color: 'text-gray-500', 
          bgColor: 'bg-gray-100',
          darkBgColor: 'bg-gray-900/30',
          label: 'To Do' 
        };
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: { light: 'bg-red-500', dark: 'bg-red-400' },
      high: { light: 'bg-orange-500', dark: 'bg-orange-400' },
      medium: { light: 'bg-yellow-500', dark: 'bg-yellow-400' },
      low: { light: 'bg-green-500', dark: 'bg-green-400' }
    };
    return colors[priority] || { light: 'bg-gray-500', dark: 'bg-gray-400' };
  };

  // Stats data
  const stats = [
    { 
      label: 'Total Tasks', 
      value: tasks.length, 
      icon: IoList,
      color: isDarkMode ? 'text-blue-400' : 'text-blue-600'
    },
    { 
      label: 'To Do', 
      value: tasks.filter(t => t.status === 'todo').length,
      icon: IoList,
      color: isDarkMode ? 'text-gray-400' : 'text-gray-600'
    },
    { 
      label: 'In Progress', 
      value: tasks.filter(t => t.status === 'in-progress').length,
      icon: IoTime,
      color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
    },
    { 
      label: 'Completed', 
      value: tasks.filter(t => t.status === 'completed').length,
      icon: IoCheckmarkCircle,
      color: isDarkMode ? 'text-green-400' : 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-12 w-12 border-b-2 ${isDarkMode ? "border-blue-500" : "border-amber-600"}`}
        />
      </div>
    );
  }

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
          <motion.h1 
            variants={itemVariants}
            className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Tasks
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage and track your tasks efficiently
          </motion.p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/dashboard/tasks/new"
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            }`}
          >
            <IoAddCircle className="w-5 h-5 mr-2" />
            New Task
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={statCardVariants}
            whileHover="hover"
            className={`rounded-2xl p-6 border-2 backdrop-blur-sm ${
              isDarkMode 
                ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700/80" 
                : "bg-white/80 border-amber-200 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {stat.label}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700/50 text-gray-300" : "bg-amber-100 text-amber-600"
                }`}
              >
                <stat.icon className="w-6 h-6" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Sorting */}
      <motion.div
        variants={cardVariants}
        className={`rounded-2xl p-6 border-2 backdrop-blur-sm ${
          isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center mr-4">
              <IoFilter className={`w-5 h-5 mr-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Filter:
              </span>
            </div>
            {['all', 'todo', 'in-progress', 'completed', 'overdue'].map((filterType) => (
              <motion.button
                key={filterType}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  filter === filterType
                    ? isDarkMode 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "bg-amber-500 text-white shadow-lg"
                    : isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {filterType.replace('-', ' ')}
              </motion.button>
            ))}
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3"
          >
            <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 border-2 rounded-xl text-sm transition-all duration-200 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
                  : "bg-white border-gray-300 text-gray-900 focus:border-amber-500"
              }`}
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </motion.div>
        </div>
      </motion.div>

      {/* Tasks List */}
      <motion.div variants={containerVariants} className="space-y-4">
        <AnimatePresence>
          {sortedTasks.map((task, index) => {
            const statusInfo = getStatusInfo(task.status, task.dueDate);
            const StatusIcon = statusInfo.icon;
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
            const priorityColor = getPriorityColor(task.priority);

            return (
              <motion.div
                key={task._id}
                variants={itemVariants}
                whileHover="hover"
                custom={index}
                className={`rounded-2xl border-2 backdrop-blur-sm overflow-hidden cursor-pointer ${
                  isDarkMode 
                    ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700/80" 
                    : "bg-white/80 border-amber-200 hover:bg-white"
                }`}
                onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm flex items-center ${
                              isDarkMode 
                                ? `${statusInfo.darkBgColor} ${statusInfo.color} border-gray-600` 
                                : `${statusInfo.bgColor} ${statusInfo.color} border-gray-200`
                            }`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </motion.span>
                          <motion.div 
                            whileHover={{ scale: 1.2 }}
                            className={`w-3 h-3 rounded-full ${isDarkMode ? priorityColor.dark : priorityColor.light}`}
                            title={`${task.priority} priority`}
                          />
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {task.project?.name && (
                          <span className={`flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <IoRocket className="w-4 h-4 mr-2" />
                            <span className="font-medium mr-1">Project:</span>
                            <span className={isDarkMode ? "text-blue-400" : "text-blue-600"}>
                              {task.project.name}
                            </span>
                          </span>
                        )}
                        
                        <span className={`flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          <IoCalendar className="w-4 h-4 mr-2" />
                          <span className="font-medium mr-1">Due:</span>
                          <span className={isOverdue ? 'text-red-500 font-semibold' : isDarkMode ? "text-gray-300" : "text-gray-900"}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </span>
                        
                        {task.assignedTo && (
                          <span className={`flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <IoPerson className="w-4 h-4 mr-2" />
                            <span className="font-medium mr-1">Assigned:</span>
                            <span>{task.assignedTo.name}</span>
                          </span>
                        )}
                        
                        {task.estimatedHours && (
                          <span className={`flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <IoTime className="w-4 h-4 mr-2" />
                            <span className="font-medium mr-1">Estimate:</span>
                            <span>{task.estimatedHours}h</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/tasks/${task._id}`);
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center ${
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/tasks/${task._id}/edit`);
                        }}
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
                </div>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {sortedTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-16 rounded-2xl border-2 backdrop-blur-sm ${
                isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-6"
              >
                📝
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                No tasks found
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-lg mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                {filter === 'all' 
                  ? 'Get started by creating your first task' 
                  : `No tasks match the "${filter}" filter`
                }
              </motion.p>
              {filter !== 'all' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter('all')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  Show all tasks
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Tasks;