import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoPeople, 
  IoDocumentText, 
  IoRocket,
  IoPricetag,
  IoBusiness,
  IoFlag,
  IoTime,
  IoStatsChart,
  IoCheckmarkCircle
} from "react-icons/io5";
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [fetchingTeams, setFetchingTeams] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]); 
  const [teams, setTeams] = useState([]);
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    team: '',
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

  // Fetch users and teams from API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingUsers(true);
        setFetchingTeams(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setFetchingUsers(false);
          setFetchingTeams(false);
          return;
        }

        const [usersResponse, teamsResponse] = await Promise.all([
          axios.get('https://project-pilot-1-6k3l.onrender.com/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://project-pilot-1-6k3l.onrender.com/api/teams/my-teams', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data);
        } else if (usersResponse.data && Array.isArray(usersResponse.data.data)) {
          setUsers(usersResponse.data.data);
        } else {
          setUsers([]);
        }

        if (teamsResponse.data && Array.isArray(teamsResponse.data.data)) {
          setTeams(teamsResponse.data.data);
        } else if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
          setTeams(teamsResponse.data);
        } else {
          setTeams([]);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        toast.error('Failed to load team data');
      } finally {
        setFetchingUsers(false);
        setFetchingTeams(false);
      }
    };

    fetchData();
  }, []);

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

      if (!formData.team) {
        toast.error('Please select a team for the project');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        team: formData.team,
        teamMembers: formData.teamMembers,
        priority: formData.priority,
        ...(formData.budget && { budget: parseFloat(formData.budget) }),
        ...(formData.client && { client: formData.client.trim() })
      };

      const response = await axios.post('https://project-pilot-1-6k3l.onrender.com/api/projects', projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Project created successfully!');
      navigate('/dashboard/projects');
      
    } catch (err) {
      console.error('Error creating project:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.error || 
                            err.response.data?.message || 
                            `Server error: ${err.response.status}`;
        toast.error(errorMessage);
        setError(errorMessage);
      } else if (err.request) {
        toast.error('Network error: Could not connect to server');
        setError('Network error: Could not connect to server');
      } else {
        toast.error('Unexpected error occurred');
        setError('Unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTeamMembers = () => {
    return users.filter(user => {
      const userId = user._id || user.id;
      return userId && formData.teamMembers.includes(userId);
    });
  };

  const today = new Date().toISOString().split('T')[0];

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
            to="/dashboard/projects" 
            className={`inline-flex items-center font-medium transition-colors ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-amber-700 hover:text-amber-800"
            }`}
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Back to Projects
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
              Create New Project
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Start a new project and assign team members
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
            <IoRocket className="h-7 w-7 text-white" />
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

              {/* Team Selection */}
              <motion.div className="md:col-span-2" variants={itemVariants}>
                <label htmlFor="team" className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Team *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="team"
                  name="team"
                  required
                  value={formData.team}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                      : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name} {team.members && `(${team.members.length} members)`}
                    </option>
                  ))}
                </motion.select>
                <AnimatePresence>
                  {fetchingTeams && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Loading teams...
                    </motion.p>
                  )}
                </AnimatePresence>
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
                  min={today}
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
                  min={formData.startDate || today}
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
              <AnimatePresence>
                {fetchingUsers && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`ml-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    (Loading...)
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.h2>

            <AnimatePresence>
              {fetchingUsers ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className={`rounded-full h-8 w-8 border-b-2 ${
                      isDarkMode ? "border-blue-500" : "border-amber-500"
                    }`}
                  />
                  <span className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Loading team members...
                  </span>
                </motion.div>
              ) : users.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center py-12 rounded-xl ${
                    isDarkMode ? "bg-gray-700/50" : "bg-amber-50"
                  }`}
                >
                  <div className="text-4xl mb-3">👥</div>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    No team members found
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Add team members to assign them to projects
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((user, index) => (
                      <motion.label 
                        key={user._id || user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isDarkMode 
                            ? formData.teamMembers.includes(user._id || user.id)
                              ? 'border-blue-500 bg-blue-900/20 shadow-lg'
                              : 'border-gray-600 bg-gray-700 hover:border-gray-400'
                            : formData.teamMembers.includes(user._id || user.id)
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.teamMembers.includes(user._id || user.id)}
                          onChange={() => handleTeamMemberChange(user._id || user.id)}
                          className="hidden"
                        />
                        <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center mr-4 transition-all ${
                          formData.teamMembers.includes(user._id || user.id)
                            ? 'border-blue-500 bg-blue-500 shadow-inner'
                            : isDarkMode 
                              ? 'border-gray-400 bg-gray-600' 
                              : 'border-gray-300 bg-gray-50'
                        }`}>
                          {formData.teamMembers.includes(user._id || user.id) && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {user.name || user.username || 'Unknown User'}
                          </div>
                          <div className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {user.email || 'No email'}
                          </div>
                          {user.role && (
                            <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                              isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-600"
                            }`}>
                              {user.role}
                            </div>
                          )}
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  {/* Selected Team Members Preview */}
                  <AnimatePresence>
                    {getSelectedTeamMembers().length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-6 p-4 rounded-xl ${
                          isDarkMode ? "bg-gray-700/50" : "bg-amber-50"
                        }`}
                      >
                        <h3 className={`font-semibold mb-3 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          Selected Team Members ({getSelectedTeamMembers().length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedTeamMembers().map((user, index) => (
                            <motion.span 
                              key={user._id || user.id}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                                isDarkMode 
                                  ? "bg-blue-900 text-blue-100" 
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.name || user.username || 'Unknown User'}
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                                type="button"
                                onClick={() => handleTeamMemberChange(user._id || user.id)}
                                className={`ml-2 text-lg leading-none ${
                                  isDarkMode ? "text-blue-300 hover:text-blue-100" : "text-blue-600 hover:text-blue-800"
                                }`}
                              >
                                ×
                              </motion.button>
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </AnimatePresence>
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
                to="/dashboard/projects"
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
              disabled={loading || fetchingUsers || fetchingTeams || !formData.team}
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
                  Creating Project...
                </>
              ) : (
                <>
                  <IoRocket className="w-5 h-5 mr-2" />
                  Create Project
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateProject;