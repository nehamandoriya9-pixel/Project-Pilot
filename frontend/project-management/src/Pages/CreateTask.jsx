import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  IoArrowBack,
  IoCalendar,
  IoPerson,
  IoFlag,
  IoTime,
  IoPricetag,
  IoDocumentText,
  IoAddCircle,
  IoRocket,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAlertCircle,
  IoInformationCircle,
} from "react-icons/io5";
import { useTheme } from "../contexts/ThemeContext";

const CreateTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    estimatedHours: "",
    tags: [],
    newTag: "",
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Check if we're in edit mode
  const isEditMode = Boolean(id);

  // Fetch projects and users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const token = localStorage.getItem("token");

        // Fetch projects
        const projectsResponse = await axios.get(
          "http://localhost:5000/api/projects",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(projectsResponse.data);

        // Fetch users
        const usersResponse = await axios.get(
          "http://localhost:5000/api/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(usersResponse.data);

        // If in edit mode, fetch task data
        if (isEditMode) {
          const taskResponse = await axios.get(
            `http://localhost:5000/api/tasks/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const task = taskResponse.data;
          setFormData({
            title: task.title || "",
            description: task.description || "",
            project: task.project?._id || "",
            assignedTo: task.assignedTo?._id || "",
            status: task.status || "todo",
            priority: task.priority || "medium",
            dueDate: task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : "",
            estimatedHours: task.estimatedHours || "",
            tags: task.tags || [],
            newTag: "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (
      formData.newTag.trim() &&
      !formData.tags.includes(formData.newTag.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: {
        light: "bg-red-500",
        dark: "bg-red-400",
        text: "text-red-600",
        badge: "bg-red-100 text-red-800 border-red-300",
      },
      high: {
        light: "bg-orange-500",
        dark: "bg-orange-400",
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-800 border-orange-300",
      },
      medium: {
        light: "bg-yellow-500",
        dark: "bg-yellow-400",
        text: "text-yellow-600",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      low: {
        light: "bg-green-500",
        dark: "bg-green-400",
        text: "text-green-600",
        badge: "bg-green-100 text-green-800 border-green-300",
      },
    };
    return (
      colors[priority] || {
        light: "bg-gray-500",
        dark: "bg-gray-400",
        text: "text-gray-600",
        badge: "bg-gray-100 text-gray-800 border-gray-300",
      }
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: {
        light: "bg-green-100 text-green-800 border-green-300",
        dark: "bg-green-900/30 text-green-300 border-green-700",
      },
      "in-progress": {
        light: "bg-blue-100 text-blue-800 border-blue-300",
        dark: "bg-blue-900/30 text-blue-300 border-blue-700",
      },
      review: {
        light: "bg-yellow-100 text-yellow-800 border-yellow-300",
        dark: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
      },
      todo: {
        light: "bg-gray-100 text-gray-800 border-gray-300",
        dark: "bg-gray-900/30 text-gray-300 border-gray-700",
      },
    };
    return colors[status] || colors.todo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.project ||
        !formData.dueDate
      ) {
        setError("Title, description, project, and due date are required");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        assignedTo: formData.assignedTo || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      const token = localStorage.getItem("token");
      let response;

      if (isEditMode) {
        response = await axios.put(
          `http://localhost:5000/api/tasks/${id}`,
          taskData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/tasks",
          taskData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Show success message
      alert(`Task ${isEditMode ? "updated" : "created"} successfully!`);

      // Redirect to tasks page or the task details
      if (isEditMode) {
        navigate(`/dashboard/tasks/${id}`);
      } else {
        navigate("/dashboard/tasks");
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} task:`, err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} task`
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div
        className={`flex items-center justify-center h-64 ${
          isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-blue-500" : "border-amber-600"
          }`}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen py-8 ${
        isDarkMode ? "bg-gray-900" : "bg-[#FFF6E0]"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={isEditMode ? `/dashboard/tasks/${id}` : "/dashboard/tasks"}
              className={`inline-flex items-center font-medium mb-6 transition-colors ${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-amber-700 hover:text-amber-800"
              }`}
            >
              <IoArrowBack className="w-5 h-5 mr-2" />
              {isEditMode ? "Back to Task" : "Back to Tasks"}
            </Link>
          </motion.div>

          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {isEditMode ? "Edit Task" : "Create New Task"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                {isEditMode
                  ? "Update task information and details"
                  : "Create a new task and assign it to team members"}
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-600 to-purple-600"
                  : "bg-gradient-to-br from-amber-500 to-amber-600"
              }`}
            >
              <IoDocumentText className="h-7 w-7 text-white" />
            </motion.div>
          </div>
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
                <IoAlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-2xl shadow-xl border backdrop-blur-sm overflow-hidden ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700"
              : "bg-white/80 border-amber-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <motion.div variants={itemVariants}>
              <motion.h2
                whileHover={{ x: 5 }}
                className={`text-xl font-semibold mb-6 flex items-center ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium mr-4 shadow-lg ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                  }`}
                >
                  <IoDocumentText className="h-5 w-5" />
                </span>
                Basic Information
              </motion.h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className={`block text-sm font-medium mb-3 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Task Title *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    id="title"
                    name="title"
                    whileHover="hover"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 cursor-pointer ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-700/80"
                        : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500/20 hover:bg-white"
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className={`block text-sm font-medium mb-3 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
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
                </div>
              </div>
            </motion.div>

            {/* Task Details */}
            <motion.div variants={itemVariants}>
              <motion.h2
                whileHover={{ x: 5 }}
                className={`text-xl font-semibold mb-6 flex items-center ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium mr-4 shadow-lg ${
                    isDarkMode
                      ? "bg-gradient-to-br from-green-600 to-green-700 text-white"
                      : "bg-gradient-to-br from-green-500 to-green-600 text-white"
                  }`}
                >
                  <IoRocket className="h-5 w-5" />
                </span>
                Task Details
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project */}
                <div>
                  <label
                    htmlFor="project"
                    className={`block text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <IoPricetag className="w-4 h-4 mr-2" />
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
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Assigned To */}
                <div>
                  <label
                    htmlFor="assignedTo"
                    className={`block text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <IoPerson className="w-4 h-4 mr-2" />
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
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className={`block text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <IoCheckmarkCircle className="w-4 h-4 mr-2" />
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
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className={`block text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <IoFlag className="w-4 h-4 mr-2" />
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
                </div>

                {/* Due Date */}
                <div>
                  <label
                    htmlFor="dueDate"
                    className={`block text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <IoCalendar className="w-4 h-4 mr-2" />
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
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                        : "border-gray-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500/20"
                    }`}
                  />
                </div>

                {/* Estimated Hours */}
                <div>
                  <label
                    htmlFor="estimatedHours"
                    className={`block text-sm font-medium mb-3 flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <IoTime className="w-4 h-4 mr-2" />
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
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div variants={itemVariants}>
              <motion.h2
                whileHover={{ x: 5 }}
                className={`text-xl font-semibold mb-6 flex items-center ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium mr-4 shadow-lg ${
                    isDarkMode
                      ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white"
                      : "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                  }`}
                >
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newTag: e.target.value,
                      }))
                    }
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
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                      isDarkMode
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-500 text-white hover:bg-green-600"
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
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-wrap gap-2"
                    >
                      {formData.tags.map((tag, index) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border backdrop-blur-sm ${
                            isDarkMode
                              ? "bg-purple-900/30 text-purple-300 border-purple-700"
                              : "bg-purple-100 text-purple-800 border-purple-200"
                          }`}
                        >
                          {tag}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-lg leading-none"
                          >
                            <IoCloseCircle className="w-4 h-4" />
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
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <h3
                className={`font-semibold mb-4 flex items-center ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <IoInformationCircle className="w-5 h-5 mr-2" />
                Task Preview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Title:
                  </span>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formData.title || "No title"}
                  </p>
                </div>
                <div>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Project:
                  </span>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {projects.find((p) => p._id === formData.project)?.name ||
                      "Not selected"}
                  </p>
                </div>
                <div>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Priority:
                  </span>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        isDarkMode
                          ? getPriorityColor(formData.priority).dark
                          : getPriorityColor(formData.priority).light
                      }`}
                    />
                    <span
                      className={`font-medium capitalize ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formData.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Status:
                  </span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm inline-block ${
                      isDarkMode
                        ? getStatusColor(formData.status).dark
                        : getStatusColor(formData.status).light
                    }`}
                  >
                    {formData.status.replace("-", " ")}
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={
                    isEditMode ? `/dashboard/tasks/${id}` : "/dashboard/tasks"
                  }
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </motion.svg>
                    {isEditMode ? "Updating Task..." : "Creating Task..."}
                  </>
                ) : (
                  <>
                    <IoAddCircle className="w-5 h-5 mr-2" />
                    {isEditMode ? "Update Task" : "Create Task"}
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
            isDarkMode
              ? "bg-gray-800/80 border border-gray-700"
              : "bg-amber-50/80 border border-amber-200"
          }`}
        >
          <h3
            className={`font-semibold mb-3 flex items-center ${
              isDarkMode ? "text-blue-400" : "text-amber-900"
            }`}
          >
            <span className="text-lg mr-2">💡</span>
            Task Creation Tips
          </h3>
          <ul
            className={`text-sm space-y-2 ${
              isDarkMode ? "text-blue-300" : "text-amber-800"
            }`}
          >
            <li className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  isDarkMode ? "bg-blue-400" : "bg-amber-500"
                }`}
              />
              Use clear, descriptive titles that summarize the task
            </li>
            <li className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  isDarkMode ? "bg-blue-400" : "bg-amber-500"
                }`}
              />
              Provide detailed descriptions with specific requirements
            </li>
            <li className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  isDarkMode ? "bg-blue-400" : "bg-amber-500"
                }`}
              />
              Set realistic due dates and priorities
            </li>
            <li className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  isDarkMode ? "bg-blue-400" : "bg-amber-500"
                }`}
              />
              Assign tasks to appropriate team members
            </li>
            <li className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  isDarkMode ? "bg-blue-400" : "bg-amber-500"
                }`}
              />
              Use tags for better organization and filtering
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateTask;
