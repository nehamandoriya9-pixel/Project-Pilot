import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamAPI } from '../services/api';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTheme } from '../contexts/ThemeContext';
import { 
  IoArrowBack, 
  IoPeople, 
  IoChatbubbleEllipses,
  IoDocumentText,
  IoStatsChart,
  IoSettings,
  IoAddCircle,
  IoClose,
  IoTrash,
  IoExit,
  IoAttach,
  IoTime,
  IoCheckmarkCircle,
  IoRocket,
  IoSave
} from "react-icons/io5";

// Environment-based API configuration
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const Teams = () => {
  const { teamId } = useParams();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [teamProjects, setTeamProjects] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteData, setInviteData] = useState({ email: '', role: 'member' });

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
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

  // Load teams on component mount
  useEffect(() => {
    loadTeams();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
      const API_URL = getApiUrl();
      socketRef.current = io(API_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  // Handle team room changes
  useEffect(() => {
    if (socketRef.current && activeTeam) {
      socketRef.current.emit('leave_team_room');
      socketRef.current.emit('join_team_room', activeTeam._id);
      setupTeamSocketListeners();
    }
  }, [activeTeam]);

  // Set up socket event listeners
  const setupTeamSocketListeners = () => {
    if (!socketRef.current || !activeTeam) return;

    // Remove existing listeners
    socketRef.current.off('new_message');
    socketRef.current.off('message_updated');
    socketRef.current.off('message_deleted');
    socketRef.current.off('user_typing');
    socketRef.current.off('user_stop_typing');
    socketRef.current.off('member_joined');
    socketRef.current.off('member_left');
    socketRef.current.off('member_role_updated');
    socketRef.current.off('team_updated');
    socketRef.current.off('new_activity');

    // Add new listeners
    socketRef.current.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('message_updated', (updatedMessage) => {
      setMessages(prev => 
        prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg)
      );
    });
   
    socketRef.current.on('message_deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    socketRef.current.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const existing = prev.find(user => user.userId === data.userId);
        if (existing) return prev;
        return [...prev, { userId: data.userId, userName: data.userName }];
      });
    });

    socketRef.current.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    socketRef.current.on('member_joined', (data) => {
      loadTeamDetails(activeTeam._id);
      setActivities(prev => [data.activity, ...prev]);
    });

    socketRef.current.on('member_left', (data) => {
      loadTeamDetails(activeTeam._id);
      setActivities(prev => [data.activity, ...prev]);
    });

    socketRef.current.on('member_role_updated', (data) => {
      loadTeamDetails(activeTeam._id);
      setActivities(prev => [data.activity, ...prev]);
    });

    socketRef.current.on('team_updated', (updatedTeam) => {
      setActiveTeam(updatedTeam);
      setTeams(prev => 
        prev.map(team => team._id === updatedTeam._id ? updatedTeam : team)
      );
    });

    socketRef.current.on('new_activity', (activity) => {
      setActivities(prev => [activity, ...prev]);
    });
  };

  // Load team data when teamId or activeTab changes
  useEffect(() => {
    if (teamId) {
      loadTeamDetails(teamId);
    } else if (activeTeam) {
      loadTeamData();
    }
  }, [teamId, activeTeam, activeTab]);

  // Data loading functions
  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getMyTeams();
      setTeams(response.data.data);
      
      if (teamId) {
        const team = response.data.data.find(team => team._id === teamId);
        setActiveTeam(team);
      } else if (response.data.data.length > 0) {
        setActiveTeam(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (id) => {
    try {
      const response = await teamAPI.getTeam(id);
      setActiveTeam(response.data.data);
    } catch (error) {
      console.error('Failed to load team details:', error);
    }
  };

  const loadTeamData = async () => {
    if (!activeTeam) return;

    try {
      switch (activeTab) {
        case 'discussion':
          await loadMessages();
          break;
        case 'activity':
          await loadActivities();
          break;
        case 'analytics':
          await loadAnalytics();
          break;
        case 'projects':
          await loadTeamProjects();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to load team data:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await teamAPI.getMessages(activeTeam._id);
      setMessages(response.data.data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await teamAPI.getActivities(activeTeam._id);
      setActivities(response.data.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await teamAPI.getAnalytics(activeTeam._id);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadTeamProjects = async () => {
    try {
      const response = await teamAPI.getTeamProjects(activeTeam._id);
      setTeamProjects(response.data.data);
    } catch (error) {
      console.error('Failed to load team projects:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Event handlers
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await teamAPI.sendMessage(activeTeam._id, {
        content: newMessage,
        mentions: []
      });

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadingFile(true);
      const fakeUpload = {
        filename: file.name,
        url: URL.createObjectURL(file),
        fileType: file.type,
        size: file.size
      };

      await teamAPI.sendMessage(activeTeam._id, {
        content: `Shared file: ${file.name}`,
        attachments: [fakeUpload]
      });

      await loadMessages();
    } catch (error) {
      console.error('Failed to share file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Creating team with data:', newTeam);
    
    try {
      const teamData = {
        name: newTeam.name || `Team ${Date.now()}`,
        description: newTeam.description || "No description provided"
      };
      
      const response = await teamAPI.createTeam(teamData);
      console.log('Team created successfully:', response.data);
      
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
      await loadTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      alert(`Failed to create team: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.inviteMember(activeTeam._id, inviteData.email, inviteData.role);
      await loadTeamDetails(activeTeam._id);
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'member' });
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await teamAPI.removeMember(activeTeam._id, memberId);
      await loadTeams();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await teamAPI.updateMemberRole(activeTeam._id, memberId, newRole);
      await loadTeamDetails(activeTeam._id);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      await teamAPI.removeMember(teamId, currentUser.id);
      
      const updatedTeams = teams.filter(team => team._id !== teamId);
      setTeams(updatedTeams);
      
      if (updatedTeams.length > 0) {
        setActiveTeam(updatedTeams[0]);
      } else {
        setActiveTeam(null);
      }
    } catch (error) {
      console.error('Failed to leave team:', error);
    }
  };

  // Helper functions
  const isCurrentUserAdmin = () => {
    if (!activeTeam || !activeTeam.members) return false;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return activeTeam.members.some(member => 
      member.user._id === currentUser.id && member.role === 'admin'
    );
  };

  const isCurrentUserMember = () => {
    if (!activeTeam || !activeTeam.members) return false;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return activeTeam.members.some(member => 
      member.user._id === currentUser.id
    );
  };

  const formatActivity = (activity) => {
    const actions = {
      team_created: 'created the team',
      member_joined: 'joined the team',
      member_left: 'left the team',
      member_removed: 'was removed from the team',
      role_changed: 'changed role',
      project_created: 'created a project',
      project_updated: 'updated a project',
      task_created: 'created a task',
      task_completed: 'completed a task',
      message_sent: 'sent a message',
      file_uploaded: 'uploaded a file'
    };

    return `${activity.user.name} ${actions[activity.action] || activity.action}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading state
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

  // No teams state
  if (!activeTeam && teams.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">👥</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>No Teams Yet</h2>
          <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Create your first team to get started!</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            }`}
            onClick={() => setShowCreateModal(true)}
          >
            <IoAddCircle className="w-5 h-5 mr-2 inline" />
            Create Your First Team
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex ${isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"}`}
    >
      {/* Sidebar - Team List */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`w-80 border-r backdrop-blur-sm flex flex-col ${
          isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
        }`}
      >
        <div className="p-6 border-b backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>My Teams</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                isDarkMode 
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                  : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCreateModal(true);
              }}
            >
              <IoAddCircle className="w-4 h-4 mr-1 inline" />
              Create Team
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>No teams yet. Create your first team! 🚀</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {teams.map((team, index) => (
                <motion.div
                  key={team._id}
                  variants={itemVariants}
                  whileHover="hover"
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 backdrop-blur-sm ${
                    activeTeam?._id === team._id 
                      ? (isDarkMode 
                          ? "bg-blue-900/30 border-blue-700 text-white" 
                          : "bg-blue-50 border-blue-500 text-gray-900")
                      : (isDarkMode 
                          ? "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                  }`}
                  onClick={() => setActiveTeam(team)}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                        activeTeam?._id === team._id 
                          ? (isDarkMode ? "bg-blue-600" : "bg-blue-500")
                          : (isDarkMode ? "bg-blue-600" : "bg-amber-500")
                      } text-white`}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{team.name}</h4>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {team.members.length} members
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content - Team Details */}
      <div className="flex-1 flex flex-col">
        {!activeTeam ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">👥</div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Select a team</h2>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Choose a team from the sidebar to view details</p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Team Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 border-b backdrop-blur-sm ${
                isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{activeTeam.name}</h1>
                  <p className={`mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{activeTeam.description}</p>
                  <div className={`flex items-center space-x-3 mt-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <span>{activeTeam.members.length} members</span>
                    <span>•</span>
                    <span>Created by {activeTeam.createdBy?.name}</span>
                    <span>•</span>
                    <span>Join Code: <code className={`px-2 py-1 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>{activeTeam.joinCode}</code></span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {isCurrentUserAdmin() && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                        isDarkMode 
                          ? "bg-gradient-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800" 
                          : "bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      }`}
                      onClick={() => setShowInviteModal(true)}
                    >
                      <IoAddCircle className="w-4 h-4 mr-1 inline" />
                      Invite Members
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                      isDarkMode 
                        ? "bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800" 
                        : "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    }`}
                    onClick={() => handleLeaveTeam(activeTeam._id)}
                  >
                    <IoExit className="w-4 h-4 mr-1 inline" />
                    Leave Team
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className={`border-b backdrop-blur-sm ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
            }`}>
              <div className="flex space-x-1 px-6">
                {[
                  { id: 'members', label: 'Members', icon: IoPeople },
                  { id: 'discussion', label: 'Discussion', icon: IoChatbubbleEllipses },
                  { id: 'activity', label: 'Activity', icon: IoTime },
                  { id: 'projects', label: 'Projects', icon: IoDocumentText },
                  { id: 'analytics', label: 'Analytics', icon: IoStatsChart },
                  { id: 'settings', label: 'Settings', icon: IoSettings }
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 flex items-center ${
                      activeTab === tab.id
                        ? (isDarkMode 
                            ? "border-blue-500 text-blue-400" 
                            : "border-amber-500 text-amber-600")
                        : (isDarkMode 
                            ? "border-transparent text-gray-400 hover:text-gray-300" 
                            : "border-transparent text-gray-500 hover:text-gray-700")
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Members</h3>
                      {isCurrentUserAdmin() && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                            isDarkMode 
                              ? "bg-gradient-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800" 
                              : "bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                          }`}
                          onClick={() => setShowInviteModal(true)}
                        >
                          <IoAddCircle className="w-4 h-4 mr-1 inline" />
                          Invite Members
                        </motion.button>
                      )}
                    </div>
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeTeam.members.map((member, index) => (
                        <motion.div
                          key={member.user._id}
                          variants={itemVariants}
                          whileHover="hover"
                          className={`rounded-xl border-2 backdrop-blur-sm p-6 ${
                            isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                            >
                              {member.user.avatar ? (
                                <img 
                                  src={member.user.avatar} 
                                  alt={member.user.name}
                                  className="w-14 h-14 rounded-xl object-cover"
                                />
                              ) : (
                                member.user.name.charAt(0).toUpperCase()
                              )}
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{member.user.name}</h4>
                              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{member.user.email}</p>
                              
                              <div className="mt-3">
                                <motion.select
                                  whileFocus={{ scale: 1.01 }}
                                  value={member.role}
                                  onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                                  disabled={!isCurrentUserAdmin()}
                                  className={`w-full px-3 py-2 border-2 rounded-lg text-sm transition-all duration-200 ${
                                    isDarkMode 
                                      ? "bg-gray-600 border-gray-500 text-white" 
                                      : "bg-white border-gray-300 text-gray-900"
                                  } ${!isCurrentUserAdmin() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="member">Member</option>
                                  <option value="viewer">Viewer</option>
                                </motion.select>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              {(isCurrentUserAdmin() && member.role !== 'admin') && (
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRemoveMember(member.user._id)}
                                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isDarkMode 
                                      ? "bg-red-600 text-white hover:bg-red-700" 
                                      : "bg-red-500 text-white hover:bg-red-600"
                                  }`}
                                >
                                  <IoTrash className="w-3 h-3 inline mr-1" />
                                  Remove
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Discussion Tab */}
                {activeTab === 'discussion' && (
                  <div className="flex flex-col h-[600px]">
                    <div className="mb-6">
                      <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Discussion</h3>
                      <p className={`mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Chat with your team members in real-time</p>
                    </div>

                    <div className={`flex-1 rounded-xl border-2 backdrop-blur-sm p-6 mb-4 overflow-y-auto ${
                      isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                    }`}>
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>No messages yet. Start the conversation!</p>
                          </div>
                        </div>
                      ) : (
                        <motion.div variants={containerVariants} className="space-y-4">
                          {messages.map((message, index) => (
                            <motion.div
                              key={message._id}
                              variants={itemVariants}
                              whileHover="hover"
                              className="flex space-x-4"
                            >
                              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                                {message.user.avatar ? (
                                  <img 
                                    src={message.user.avatar} 
                                    alt={message.user.name}
                                    className="w-10 h-10 rounded-xl object-cover"
                                  />
                                ) : (
                                  message.user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              
                              <div className={`flex-1 rounded-xl border-2 backdrop-blur-sm p-4 ${
                                isDarkMode ? "bg-gray-600/50 border-gray-500" : "bg-gray-50 border-gray-200"
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <strong className={isDarkMode ? "text-white" : "text-gray-900"}>{message.user.name}</strong>
                                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                
                                <div className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                  {message.content}
                                </div>

                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-3">
                                    {message.attachments.map((file, index) => (
                                      <motion.div 
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                        }`}
                                      >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                          isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"
                                        }`}>
                                          {file.fileType.startsWith('image/') ? '🖼️' : '📄'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <a 
                                            href={file.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`font-medium hover:underline ${
                                              isDarkMode ? "text-blue-400" : "text-blue-600"
                                            }`}
                                          >
                                            {file.filename}
                                          </a>
                                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {formatFileSize(file.size)}
                                          </p>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={messagesEndRef} />
                        </motion.div>
                      )}
                    </div>

                    {/* Message Input */}
                    <motion.form 
                      variants={itemVariants}
                      onSubmit={handleSendMessage} 
                      className="flex space-x-4"
                    >
                      <div className="flex-1">
                        <motion.input
                          whileFocus={{ scale: 1.01 }}
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message... Use @ to mention teammates"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                            isDarkMode 
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                              : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                          }`}
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <motion.label 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center ${
                            isDarkMode 
                              ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <IoAttach className="w-5 h-5" />
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            className="hidden"
                            disabled={uploadingFile}
                          />
                        </motion.label>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit" 
                          disabled={!newMessage.trim() || uploadingFile}
                          className={`px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg ${
                            isDarkMode 
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                              : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                          }`}
                        >
                          {uploadingFile ? (
                            <>
                              <motion.svg
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 mr-2 inline"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </motion.svg>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <IoChatbubbleEllipses className="w-5 h-5 mr-2 inline" />
                              Send
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.form>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div>
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Activity</h3>
                    <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Recent actions and updates from your team</p>
                    
                    <div className={`rounded-xl border-2 backdrop-blur-sm p-6 max-h-96 overflow-y-auto ${
                      isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                    }`}>
                      {activities.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">📋</div>
                          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>No recent activities. Team actions will appear here!</p>
                        </div>
                      ) : (
                        <motion.div variants={containerVariants} className="space-y-4">
                          {activities.map((activity, index) => (
                            <motion.div
                              key={activity._id}
                              variants={itemVariants}
                              whileHover="hover"
                              className={`flex items-center space-x-4 p-4 rounded-xl border-2 backdrop-blur-sm ${
                                isDarkMode ? "bg-gray-600/50 border-gray-500" : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {activity.user.avatar ? (
                                  <img 
                                    src={activity.user.avatar} 
                                    alt={activity.user.name}
                                    className="w-10 h-10 rounded-xl object-cover"
                                  />
                                ) : (
                                  activity.user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                  {formatActivity(activity)}
                                </p>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {new Date(activity.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div>
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Projects</h3>
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teamProjects.length === 0 ? (
                        <motion.div
                          variants={itemVariants}
                          className="col-span-full text-center py-12"
                        >
                          <div className="text-6xl mb-4">📁</div>
                          <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>No projects yet. Create your first project!</p>
                          <Link 
                            to="/dashboard/projects/"
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg inline-block ${
                              isDarkMode 
                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                                : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                            }`}
                          >
                            <IoRocket className="w-5 h-5 mr-2 inline" />
                            Create Project
                          </Link>
                        </motion.div>
                      ) : (
                        teamProjects.map((project, index) => (
                          <motion.div
                            key={project._id}
                            variants={itemVariants}
                            whileHover="hover"
                            className={`rounded-xl border-2 backdrop-blur-sm p-6 ${
                              isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                            }`}
                          >
                            <h4 className={`font-bold text-lg mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{project.name}</h4>
                            <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{project.description}</p>
                            <div className={`flex items-center justify-between text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              <span>Status: {project.status}</span>
                              <Link 
                                to={`/projects/${project._id}`}
                                className={`font-medium hover:underline ${
                                  isDarkMode ? "text-blue-400" : "text-blue-600"
                                }`}
                              >
                                View →
                              </Link>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div>
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Analytics</h3>
                    <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Insights and performance metrics for your team</p>
                    
                    {analytics ? (
                      <motion.div variants={containerVariants} className="space-y-8">
                        {/* Overview Cards */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {[
                            { label: "Total Members", value: analytics.overview.totalMembers, color: "blue" },
                            { label: "Total Projects", value: analytics.overview.totalProjects, color: "green" },
                            { label: "Task Completion", value: `${analytics.overview.completionRate}%`, color: "yellow" },
                            { label: "Total Messages", value: analytics.overview.totalMessages, color: "purple" }
                          ].map((stat, index) => (
                            <motion.div
                              key={stat.label}
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
                                  {stat.label === "Task Completion" && (
                                    <small className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}>
                                      {analytics.overview.completedTasks}/{analytics.overview.totalTasks} tasks
                                    </small>
                                  )}
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    isDarkMode ? "bg-gray-600/50 text-gray-300" : "bg-amber-100 text-amber-600"
                                  }`}
                                >
                                  {stat.label === "Total Members" && <IoPeople className="w-6 h-6" />}
                                  {stat.label === "Total Projects" && <IoDocumentText className="w-6 h-6" />}
                                  {stat.label === "Task Completion" && <IoCheckmarkCircle className="w-6 h-6" />}
                                  {stat.label === "Total Messages" && <IoChatbubbleEllipses className="w-6 h-6" />}
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Member Activity */}
                        <motion.div variants={itemVariants} className={`rounded-xl border-2 backdrop-blur-sm p-6 ${
                          isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                        }`}>
                          <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Member Activity</h4>
                          <div className="space-y-4">
                            {analytics.memberActivity.map((member, index) => (
                              <motion.div
                                key={member._id}
                                whileHover={{ scale: 1.02 }}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                  isDarkMode ? "bg-gray-600/50" : "bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                    {member.user.avatar ? (
                                      <img 
                                        src={member.user.avatar} 
                                        alt={member.user.name}
                                        className="w-10 h-10 rounded-xl object-cover"
                                      />
                                    ) : (
                                      member.user.name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <span className={isDarkMode ? "text-gray-300" : "text-gray-900"}>{member.user.name}</span>
                                </div>
                                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {member.activityCount} activities
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Task Status */}
                        <motion.div variants={itemVariants} className={`rounded-xl border-2 backdrop-blur-sm p-6 ${
                          isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                        }`}>
                          <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Task Status</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Completed</span>
                                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{analytics.charts.taskStatus.completed}</span>
                              </div>
                              <div className={`w-full rounded-full h-3 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(analytics.charts.taskStatus.completed / (analytics.charts.taskStatus.completed + analytics.charts.taskStatus.pending)) * 100}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="bg-green-500 h-3 rounded-full"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Pending</span>
                                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{analytics.charts.taskStatus.pending}</span>
                              </div>
                              <div className={`w-full rounded-full h-3 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(analytics.charts.taskStatus.pending / (analytics.charts.taskStatus.completed + analytics.charts.taskStatus.pending)) * 100}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="bg-yellow-500 h-3 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Loading analytics...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Settings</h3>
                    {isCurrentUserAdmin() ? (
                      <motion.div 
                        variants={itemVariants}
                        className={`rounded-xl border-2 backdrop-blur-sm p-6 ${
                          isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="space-y-6">
                          <div>
                            <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Team Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Team Name</label>
                                <motion.input
                                  whileFocus={{ scale: 1.01 }}
                                  type="text"
                                  defaultValue={activeTeam.name}
                                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                    isDarkMode 
                                      ? "border-gray-600 bg-gray-600 text-white" 
                                      : "border-gray-200 bg-white text-gray-900"
                                  }`}
                                  disabled
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Join Code</label>
                                <motion.input
                                  whileFocus={{ scale: 1.01 }}
                                  type="text"
                                  defaultValue={activeTeam.joinCode}
                                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 font-mono ${
                                    isDarkMode 
                                      ? "border-gray-600 bg-gray-600 text-white" 
                                      : "border-gray-200 bg-white text-gray-900"
                                  }`}
                                  disabled
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Permissions</h4>
                            <div className="space-y-3">
                              <label className="flex items-center">
                                <input type="checkbox" className={`rounded ${
                                  isDarkMode ? "bg-gray-600 border-gray-500" : "bg-white border-gray-300"
                                }`} />
                                <span className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Allow members to invite others</span>
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className={`rounded ${
                                  isDarkMode ? "bg-gray-600 border-gray-500" : "bg-white border-gray-300"
                                }`} />
                                <span className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Make team publicly visible</span>
                              </label>
                            </div>
                          </div>

                          <div className="pt-6 border-t backdrop-blur-sm">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                                isDarkMode 
                                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                                  : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                              }`}
                            >
                              <IoSave className="w-5 h-5 mr-2 inline" />
                              Save Settings
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className={`rounded-xl border-2 backdrop-blur-sm p-6 text-center ${
                          isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="text-6xl mb-4">⚙️</div>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Only team admins can access settings.</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Create Team Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 w-full max-w-md ${
                isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Create New Team</h2>
              <form onSubmit={handleCreateTeam}>
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Team Name *</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      placeholder="Enter team name"
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                        isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                      placeholder="What's this team for?"
                      rows="3"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 resize-none ${
                        isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                      }`}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t backdrop-blur-sm">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                      isDarkMode 
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500" 
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <IoClose className="w-5 h-5 mr-2 inline" />
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                      isDarkMode 
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                        : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                    }`}
                  >
                    <IoAddCircle className="w-5 h-5 mr-2 inline" />
                    Create Team
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Invite Member Modal */}
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-2xl shadow-xl border backdrop-blur-sm p-8 w-full max-w-md ${
                isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-amber-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Invite Team Member</h2>
              <form onSubmit={handleInviteMember}>
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email Address *</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                      placeholder="Enter member's email"
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                        isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20" 
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Role</label>
                    <motion.select
                      whileFocus={{ scale: 1.01 }}
                      value={inviteData.role}
                      onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                        isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20" 
                          : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                      }`}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </motion.select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t backdrop-blur-sm">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                    className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                      isDarkMode 
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500" 
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <IoClose className="w-5 h-5 mr-2 inline" />
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                      isDarkMode 
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
                        : "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                    }`}
                  >
                    <IoAddCircle className="w-5 h-5 mr-2 inline" />
                    Send Invite
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Teams;