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
  IoPricetag,
  IoTime,
  IoStatsChart,
  IoCreate,
  IoTrash,
  IoCheckmarkCircle,
  IoChatbubbleEllipses,
  IoAttach,
  IoPerson,
  IoFlag
} from "react-icons/io5";

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { isDarkMode } = useTheme();

  // Animation variants matching ProjectDetails
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
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setTask(response.data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError(err.response?.data?.error || 'Failed to fetch task');
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask(response.data);
    } catch (err) {
      setError('Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setTask(response.data);
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Task deleted successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/tasks');
      }, 2000);

    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.error || 'Failed to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        { 
          assignedTo: user.id,
          assigneeName: user.name 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTask(response.data);
      setSuccess('Task assigned to you successfully!');
      fetchTask();

    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.response?.data?.error || 'Failed to assign task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/tasks/${id}/comments`,
        { content: newComment },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setTask(response.data);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  // Color functions matching ProjectDetails
  const getStatusColor = (status) => {
    const colors = {
      completed: { light: 'bg-green-100 text-green-800 border-green-300', dark: 'bg-green-900/30 text-green-300 border-green-700' },
      'in-progress': { light: 'bg-blue-100 text-blue-800 border-blue-300', dark: 'bg-blue-900/30 text-blue-300 border-blue-700' },
      todo: { light: 'bg-gray-100 text-gray-800 border-gray-300', dark: 'bg-gray-900/30 text-gray-300 border-gray-700' },
      review: { light: 'bg-yellow-100 text-yellow-800 border-yellow-300', dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' }
    };
    return colors[status] || colors.todo;
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
            to="/dashboard/tasks" 
            className={`inline-flex items-center font-medium mb-4 transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Tasks
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

  if (!task) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#FFF6E0] text-gray-900"}`}>
        <Link 
          to="/dashboard/tasks" 
          className={`inline-flex items-center font-medium mb-4 ${
            isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
          }`}
        >
          ← Back to Tasks
        </Link>
        <p>Task not found.</p>
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
            to="/dashboard/tasks" 
            className={`inline-flex items-center font-medium transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Tasks
          </Link>
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl p-4 shadow-lg ${
              isDarkMode 
                ? "bg-green-900/20 border border-green-800 text-green-200" 
                : "bg-green-50 border border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-center">
              <IoCheckmarkCircle className="w-5 h-5 mr-2" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Header */}
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
              {task.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {task.description}
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize border backdrop-blur-sm ${
                isDarkMode 
                  ? getStatusColor(task.status).dark 
                  : getStatusColor(task.status).light
              }`}
            >
              {task.status.replace('-', ' ')}
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize border backdrop-blur-sm ${
                isDarkMode 
                  ? getPriorityColor(task.priority).dark 
                  : getPriorityColor(task.priority).light
              }`}
            >
              {task.priority} priority
            </motion.span>
          </div>
        </div>

        {/* Task Details Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: IoPerson, label: "Assignee", value: task.assignee || 'Unassigned', color: "blue" },
            { icon: IoCalendar, label: "Due Date", value: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date', color: "purple" },
            { icon: IoTime, label: "Created", value: new Date(task.createdAt).toLocaleDateString(), color: "green" },
            { icon: IoTime, label: "Last Updated", value: new Date(task.updatedAt).toLocaleDateString(), color: "yellow" }
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
                  <p className={`text-lg font-bold ${
                    item.color === 'blue' ? (isDarkMode ? "text-blue-400" : "text-blue-600") :
                    item.color === 'purple' ? (isDarkMode ? "text-purple-400" : "text-purple-600") :
                    item.color === 'green' ? (isDarkMode ? "text-green-400" : "text-green-600") :
                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}>
                    {item.value}
                  </p>
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

        {/* Status Update Section */}
        <motion.div 
          variants={itemVariants}
          className={`mt-8 pt-8 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <label className={`text-sm font-medium mb-4 block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Update Status
          </label>
          <motion.select 
            whileFocus={{ scale: 1.01 }}
            value={task.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`w-full md:w-64 px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
              isDarkMode 
                ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
            }`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </motion.select>
        </motion.div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Comments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Comments Section */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <IoChatbubbleEllipses className="w-6 h-6 mr-3" />
              Comments ({task.comments?.length || 0})
            </h2>
            
            <AnimatePresence>
              {task.comments?.length ? (
                <motion.div variants={containerVariants} className="space-y-6">
                  {task.comments.map((comment) => (
                    <motion.div
                      key={comment._id}
                      variants={taskItemVariants}
                      whileHover="hover"
                      className={`p-6 border-2 rounded-xl ${
                        isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {comment.userName}
                          </span>
                          <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className={`leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {comment.content}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">💬</div>
                  <p className={`text-lg mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    No comments yet
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Comment Form */}
            <motion.div 
              variants={itemVariants}
              className={`mt-8 pt-8 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <label className={`text-sm font-medium mb-4 block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Add Comment
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows="4"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 resize-none ${
                  isDarkMode 
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`mt-4 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                    : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                }`}
              >
                <IoChatbubbleEllipses className="w-5 h-5 mr-2" />
                Add Comment
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Tags Section */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <IoPricetag className="w-6 h-6 mr-3" />
              Tags
            </h2>
            
            <AnimatePresence>
              {task.tags?.length ? (
                <div className="flex flex-wrap gap-3">
                  {task.tags.map((tag, index) => (
                    <motion.span 
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm ${
                        isDarkMode 
                          ? "bg-gray-700 text-gray-300 border-gray-600" 
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-4xl mb-2">🏷️</div>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    No tags
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Attachments Section */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <IoAttach className="w-6 h-6 mr-3" />
              Attachments ({task.attachments?.length || 0})
            </h2>
            
            <AnimatePresence>
              {task.attachments?.length ? (
                <motion.div variants={containerVariants} className="space-y-4">
                  {task.attachments.map((attachment, index) => (
                    <motion.div
                      key={attachment._id}
                      variants={itemVariants}
                      whileHover="hover"
                      className={`p-4 border-2 rounded-xl flex items-center justify-between ${
                        isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <IoAttach className="w-6 h-6" />
                        </motion.div>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {attachment.name}
                          </p>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDarkMode 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        View
                      </motion.a>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-4xl mb-2">📎</div>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    No attachments
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <IoFlag className="w-6 h-6 mr-3" />
              Actions
            </h2>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/dashboard/tasks/${task._id}/edit`)}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                    : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                }`}
              >
                <IoCreate className="w-5 h-5 mr-2" />
                Edit Task
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAssignToMe}
                disabled={actionLoading}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800" 
                    : "bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                }`}
              >
                <IoPerson className="w-5 h-5 mr-2" />
                {actionLoading ? 'Assigning...' : 'Assign to Me'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteTask}
                disabled={actionLoading}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800" 
                    : "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                }`}
              >
                <IoTrash className="w-5 h-5 mr-2" />
                {actionLoading ? 'Deleting...' : 'Delete Task'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDetails;