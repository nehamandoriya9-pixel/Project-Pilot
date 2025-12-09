import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoPeople, 
  IoDocumentText,
  IoPricetag,
  IoTime,
  IoFlag,
  IoRocket,
  IoSave,
  IoClose,
  IoAddCircle,
  IoRemoveCircle
} from "react-icons/io5";
import toast from 'react-hot-toast';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
    actualHours: '',
    tags: [],
    newTag: ''
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

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

  // Fetch task data and related information
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setFetching(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required. Please login again.');
          setFetching(false);
          return;
        }

        // Fetch task details
        const taskResponse = await axios.get(`https://project-pilot-1-6k3l.onrender.com/api/tasks/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const taskData = taskResponse.data.data || taskResponse.data;
        
        if (!taskData) {
          throw new Error('Task data not found');
        }

        // Fetch projects and users in parallel
        const [projectsResponse, usersResponse] = await Promise.all([
          axios.get('https://project-pilot-1-6k3l.onrender.com/api/projects', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://project-pilot-1-6k3l.onrender.com/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProjects(projectsResponse.data.data || projectsResponse.data || []);
        setUsers(usersResponse.data.data || usersResponse.data || []);

        // Set form data
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          project: taskData.project?._id || taskData.project || '',
          assignedTo: taskData.assignedTo?._id || taskData.assignedTo || '',
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
          estimatedHours: taskData.estimatedHours || '',
          actualHours: taskData.actualHours || '',
          tags: taskData.tags || [],
          newTag: ''
        });

      } catch (err) {
        console.error('Error fetching task data:', err);
        
        if (err.response?.status === 404) {
          toast.error('Task not found. It may have been deleted.');
        } else if (err.response?.status === 403) {
          toast.error('You do not have permission to edit this task.');
        } else if (err.response?.status === 500) {
          toast.error('Server error occurred. Please try again later.');
        } else {
          toast.error(err.response?.data?.error || 'Failed to load task data');
        }
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchTaskData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.project || !formData.dueDate) {
        toast.error('Title, description, project, and due date are required');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      // Prepare data for API
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        assignedTo: formData.assignedTo || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 0,
        actualHours: formData.actualHours ? parseFloat(formData.actualHours) : 0,
        tags: formData.tags
      };

      // Remove null/undefined values
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === null || taskData[key] === undefined || taskData[key] === '') {
          delete taskData[key];
        }
      });

      console.log('Updating task with data:', taskData);

      const response = await axios.put(
        `https://project-pilot-1-6k3l.onrender.com/api/tasks/${id}`,
        taskData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Task updated successfully!');
      
      // Redirect to task details after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/tasks/${id}`);
      }, 2000);

    } catch (err) {
      console.error('Error updating task:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Color functions matching ProjectDetails
  const getStatusColor = (status) => {
    const colors = {
      completed: { light: 'bg-green-100 text-green-800 border-green-300', dark: 'bg-green-900/30 text-green-300 border-green-700' },
      'in-progress': { light: 'bg-blue-100 text-blue-800 border-blue-300', dark: 'bg-blue-900/30 text-blue-300 border-blue-700' },
      review: { light: 'bg-yellow-100 text-yellow-800 border-yellow-300', dark: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
      todo: { light: 'bg-gray-100 text-gray-800 border-gray-300', dark: 'bg-gray-900/30 text-gray-300 border-gray-700' }
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

  if (fetching) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}
    >
      
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-8"
      >
        <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to={`/dashboard/tasks/${id}`}
            className={`inline-flex items-center font-medium transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Task Details
          </Link>
        </motion.div>
      </motion.div>

      {/* Main Form Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${
          isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
        }`}
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Edit Task
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Update task information and details
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600 to-blue-700" 
                : "bg-gradient-to-br from-amber-500 to-amber-600"
            }`}
          >
            <IoDocumentText className="h-7 w-7 text-white" />
          </motion.div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information Section */}
          <motion.div variants={itemVariants}>
            <motion.h2 
              whileHover={{ x: 5 }}
              className={`text-xl font-semibold mb-6 flex items-center ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium mr-4 shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white" 
                  : "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              }`}>
                <IoDocumentText className="h-5 w-5" />
              </span>
              Basic Information
            </motion.h2>
            
            <div className="space-y-6">
              {/* Title */}
              <motion.div variants={itemVariants}>
                <label htmlFor="title" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Task Title *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <label htmlFor="description" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Description *
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the task requirements, objectives, and any specific instructions..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 resize-none ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Task Details Section */}
          <motion.div variants={itemVariants}>
            <motion.h2 
              whileHover={{ x: 5 }}
              className={`text-xl font-semibold mb-6 flex items-center ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium mr-4 shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-br from-green-600 to-green-700 text-white" 
                  : "bg-gradient-to-br from-green-500 to-green-600 text-white"
              }`}>
                <IoFlag className="h-5 w-5" />
              </span>
              Task Details
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project */}
              <motion.div variants={itemVariants}>
                <label htmlFor="project" className={`block text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <IoDocumentText className="w-4 h-4 mr-2 text-green-400" />
                  Project *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="project"
                  name="project"
                  required
                  value={formData.project}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </motion.select>
              </motion.div>

              {/* Assigned To */}
              <motion.div variants={itemVariants}>
                <label htmlFor="assignedTo" className={`block text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <IoPeople className="w-4 h-4 mr-2 text-blue-400" />
                  Assign To
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </motion.select>
              </motion.div>

              {/* Status */}
              <motion.div variants={itemVariants}>
                <label htmlFor="status" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Status
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
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

              {/* Priority */}
              <motion.div variants={itemVariants}>
                <label htmlFor="priority" className={`block text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <IoFlag className="w-4 h-4 mr-2 text-red-400" />
                  Priority
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </motion.select>
              </motion.div>

              {/* Due Date */}
              <motion.div variants={itemVariants}>
                <label htmlFor="dueDate" className={`block text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <IoCalendar className="w-4 h-4 mr-2 text-purple-400" />
                  Due Date *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              {/* Estimated Hours */}
              <motion.div variants={itemVariants}>
                <label htmlFor="estimatedHours" className={`block text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <IoTime className="w-4 h-4 mr-2 text-yellow-400" />
                  Estimated Hours
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  id="estimatedHours"
                  name="estimatedHours"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              {/* Actual Hours */}
              <motion.div variants={itemVariants}>
                <label htmlFor="actualHours" className={`block text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <IoTime className="w-4 h-4 mr-2 text-green-400" />
                  Actual Hours
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  id="actualHours"
                  name="actualHours"
                  min="0"
                  step="0.5"
                  value={formData.actualHours}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Tags Section */}
          <motion.div variants={itemVariants}>
            <motion.h2 
              whileHover={{ x: 5 }}
              className={`text-xl font-semibold mb-6 flex items-center ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium mr-4 shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white" 
                  : "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              }`}>
                <IoPricetag className="h-5 w-5" />
              </span>
              Tags
            </motion.h2>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={formData.newTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleAddTag}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                      : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                  }`}
                >
                  <IoAddCircle className="w-5 h-5 mr-2" />
                  Add
                </motion.button>
              </div>
              
              <AnimatePresence>
                {formData.tags.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-3"
                  >
                    {formData.tags.map((tag, index) => (
                      <motion.span 
                        key={tag}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm ${
                          isDarkMode 
                            ? "bg-purple-900/30 text-purple-300 border-purple-700" 
                            : "bg-purple-100 text-purple-800 border-purple-300"
                        }`}
                      >
                        {tag}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className={`ml-2 text-lg leading-none ${
                            isDarkMode ? "text-purple-300 hover:text-purple-100" : "text-purple-600 hover:text-purple-800"
                          }`}
                        >
                          <IoRemoveCircle className="w-4 h-4" />
                        </motion.button>
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-6 border-2 backdrop-blur-sm ${
              isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-amber-50 border-amber-200"
            }`}
          >
            <h3 className={`font-semibold mb-4 flex items-center ${
              isDarkMode ? "text-blue-400" : "text-amber-900"
            }`}>
              <span className="text-lg mr-2">👁️</span>
              Task Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`block mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Title:</span>
                <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {formData.title || 'No title'}
                </p>
              </div>
              <div>
                <span className={`block mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Project:</span>
                <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {projects.find(p => p._id === formData.project)?.name || 'Not selected'}
                </p>
              </div>
              <div>
                <span className={`block mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Priority:</span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${
                    isDarkMode 
                      ? getPriorityColor(formData.priority).dark 
                      : getPriorityColor(formData.priority).light
                  }`}
                >
                  {formData.priority}
                </motion.span>
              </div>
              <div>
                <span className={`block mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Status:</span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${
                    isDarkMode 
                      ? getStatusColor(formData.status).dark 
                      : getStatusColor(formData.status).light
                  }`}
                >
                  {formData.status.replace('-', ' ')}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Form Actions */}
          <motion.div 
            variants={itemVariants}
            className={`flex items-center justify-between pt-8 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={`/dashboard/tasks/${id}`}
                className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <IoClose className="w-5 h-5 mr-2 inline" />
                Cancel
              </Link>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                  : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              }`}
            >
              {loading ? (
                <>
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                  Updating Task...
                </>
              ) : (
                <>
                  <IoSave className="w-5 h-5 mr-2" />
                  Update Task
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditTask;