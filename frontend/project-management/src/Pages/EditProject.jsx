import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoDocumentText, 
  IoRocket, 
  IoSave,
  IoPeople,
  IoPricetag,
  IoBusiness,
  IoFlag,
  IoTime,
  IoStatsChart
} from 'react-icons/io5';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    teamMembers: [],
    budget: '',
    client: '',
    priority: 'medium'
  });

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

  // Status color function matching ProjectDetails
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

  // Fetch project data on component mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://project-pilot-4ju2.onrender.com/api/projects/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const project = response.data;
        setFormData({
          name: project.name || '',
          description: project.description || '',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          status: project.status || 'planning',
          teamMembers: project.teamMembers || [],
          budget: project.budget || '',
          client: project.client || '',
          priority: project.priority || 'medium'
        });
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleTeamMemberChange = (userId) => {
    setFormData(prev => {
      const updatedMembers = prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId];
      
      return {
        ...prev,
        teamMembers: updatedMembers
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim() || !formData.description.trim()) {
        toast.error('Project name and description are required');
        setLoading(false);
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error('Start date and end date are required');
        setLoading(false);
        return;
      }

      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        toast.error('End date cannot be before start date');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        teamMembers: formData.teamMembers,
        priority: formData.priority,
        ...(formData.budget && { budget: parseFloat(formData.budget) }),
        ...(formData.client && { client: formData.client.trim() })
      };

      await axios.put(`https://project-pilot-4ju2.onrender.com/api/projects/${id}`, projectData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Project updated successfully!');
      navigate(`/dashboard/projects/${id}`);
    } catch (err) {
      console.error('Error updating project:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update project';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
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
      {/* Header matching ProjectDetails */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-8"
      >
        <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to={`/dashboard/projects/${id}`} 
            className={`inline-flex items-center font-medium transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Project
          </Link>
        </motion.div>
      </motion.div>

      {/* Main Form Card matching ProjectDetails styling */}
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
              Edit Project
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Update project information and details
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

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-4 mb-6 shadow-lg ${
                isDarkMode 
                  ? "bg-red-900/20 border border-red-800 text-red-200" 
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <motion.div className="md:col-span-2" variants={itemVariants}>
                <label htmlFor="name" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Project Name *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              {/* Description */}
              <motion.div className="md:col-span-2" variants={itemVariants}>
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
                  placeholder="Describe the project goals, objectives, and scope..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 resize-none ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              {/* Dates */}
              <motion.div variants={itemVariants}>
                <label htmlFor="startDate" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Start Date *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="endDate" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  End Date *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              {/* Status & Priority */}
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
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </motion.select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="priority" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
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

              {/* Client & Budget */}
              <motion.div variants={itemVariants}>
                <label htmlFor="client" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Client
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Client name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="budget" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Budget ($)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Team Members Section */}
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
                <IoPeople className="h-5 w-5" />
              </span>
              Team Members
            </motion.h2>

            <div className={`p-6 rounded-xl ${
              isDarkMode ? "bg-gray-700/50" : "bg-amber-50"
            }`}>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Team members are managed through the team associated with this project. 
                To change team members, please update the team assignment.
              </p>
              {formData.teamMembers && formData.teamMembers.length > 0 && (
                <div className="mt-4">
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Current Team Members: {formData.teamMembers.length}
                  </p>
                </div>
              )}
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
                to={`/dashboard/projects/${id}`}
                className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
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
                  Updating Project...
                </>
              ) : (
                <>
                  <IoSave className="w-5 h-5 mr-2" />
                  Update Project
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className={`mt-8 rounded-2xl p-6 backdrop-blur-sm ${
          isDarkMode ? "bg-gray-800/80 border border-gray-700" : "bg-amber-50/80 border border-amber-200"
        }`}
      >
        <h3 className={`font-semibold mb-3 flex items-center ${
          isDarkMode ? "text-blue-400" : "text-amber-900"
        }`}>
          <span className="text-lg mr-2">💡</span>
          Editing Tips
        </h3>
        <ul className={`text-sm space-y-2 ${isDarkMode ? "text-blue-300" : "text-amber-800"}`}>
          <li className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-3 ${
              isDarkMode ? "bg-blue-400" : "bg-amber-500"
            }`} />
            Update project status to reflect current progress
          </li>
          <li className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-3 ${
              isDarkMode ? "bg-blue-400" : "bg-amber-500"
            }`} />
            Adjust dates if the project timeline changes
          </li>
          <li className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-3 ${
              isDarkMode ? "bg-blue-400" : "bg-amber-500"
            }`} />
            Modify priority based on current business needs
          </li>
          <li className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-3 ${
              isDarkMode ? "bg-blue-400" : "bg-amber-500"
            }`} />
            Keep descriptions clear and up-to-date
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default EditProject;