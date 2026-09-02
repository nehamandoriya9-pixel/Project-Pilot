// services/api.js - ENHANCED VERSION
import axios from 'axios';

const API_URL = 'https://project-pilot-1-6k3l.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests - FIXED VERSION
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token being sent:',token, token ? 'Present' : 'Missing'); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, commentData) => api.post(`/tasks/${id}/comments`, commentData),
}

export const profileAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => {console.warn( profileData, "DDDDDDDDDDDDDDDDDDD"); return api.put('/auth/profile', profileData)},
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  uploadAvatar: (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    return api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteAccount: () => api.delete('/auth/account')
}



export const teamAPI = {
  // Team Management
  getAllTeams: () => api.get('/teams'),
  getMyTeams: () => api.get('/teams/my-teams'),
  getTeam: (id) => api.get(`/teams/${id}`),
  createTeam: (teamData) => api.post('/teams', teamData),
  updateTeamSettings: (teamId, settings) => api.put(`/teams/${teamId}/settings`, settings),
  
  // Member Management
  inviteMember: (teamId, email, role) => api.post(`/teams/${teamId}/invite`, { email, role }),
  joinTeam: (teamId) => api.post(`/teams/${teamId}/join`),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  updateMemberRole: (teamId, memberId, role) => api.put(`/teams/${teamId}/members/${memberId}/role`, { role }),
  
  // Discussion
  getMessages: (teamId, params) => api.get(`/teams/${teamId}/messages`, { params }),
  sendMessage: (teamId, messageData) => api.post(`/teams/${teamId}/messages`, messageData),
  
  // Activities
  getActivities: (teamId, params) => api.get(`/teams/${teamId}/activities`, { params }),
  
  // Analytics
  getAnalytics: (teamId) => api.get(`/teams/${teamId}/analytics`),
  
  // Projects
  getTeamProjects: (teamId) => api.get(`/teams/${teamId}/projects`)
};

export default api;