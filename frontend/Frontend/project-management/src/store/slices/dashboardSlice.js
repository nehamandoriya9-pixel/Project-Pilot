import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsAPI } from '../../services/api';


export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const [projectsResponse, ] = await Promise.all([
        projectsAPI.getAll(),
        // tasksAPI.getAll()
      ]);

      return {
        projects: projectsResponse.data || [],
        // tasks: tasksResponse.data || [],
      };
    } catch (error) {
      // For development, return mock data if API fails
      console.log('Using mock dashboard data for development');
      return {
        // projects: [
        //   {
        //     _id: '1',
        //     name: 'Website Redesign',
        //     status: 'active',
        //     teamMembers: [{ _id: '1', name: 'John Doe' }],
        //     progress: 75
        //   },
        //   {
        //     _id: '2', 
        //     name: 'Mobile App',
        //     status: 'in-progress',
        //     teamMembers: [{ _id: '1', name: 'John Doe' }, { _id: '2', name: 'Jane Smith' }],
        //     progress: 45
        //   }
        // ],
        // tasks: [
        //   {
        //     _id: '1',
        //     title: 'Design Homepage',
        //     project: { _id: '1', name: 'Website Redesign' },
        //     status: 'completed',
        //     priority: 'high',
        //     dueDate: new Date().toISOString()
        //   },
        //   {
        //     _id: '2',
        //     title: 'API Integration',
        //     project: { _id: '2', name: 'Mobile App' },
        //     status: 'in-progress',
        //     priority: 'medium',
        //     dueDate: new Date().toISOString()
        //   }
        // ]
      };
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
    },
    recentProjects: [],
    recentTasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        
        const projects = action.payload.projects;
        const tasks = action.payload.tasks;
        
        // Calculate stats
        state.stats = {
          totalProjects: projects.length,
          // totalTasks: tasks.length,
        //   completedTasks: tasks.filter(task => task.status === 'completed').length,
        //   pendingTasks: tasks.filter(task => task.status === 'todo').length,
        //   inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
        };

        // Get recent projects (last 5)
        state.recentProjects = projects
          .slice(0, 5)
          .map(project => ({
            id: project._id || project.id,
            name: project.name || 'unnamed project',
            status: project.status || 'planning',
            teamMembers: project.teamMembers?.length || 0,
            progress: project.progress || Math.floor(Math.random() * 100),
          }));

        // Get recent tasks (last 5)
        // state.recentTasks = tasks
        //   .slice(0, 5)
        //   .map(task => ({
        //     id: task._id,
        //     title: task.title,
        //     project: task.project?.name || 'No Project',
        //     status: task.status,
        //     priority: task.priority,
        //     dueDate: task.dueDate,
        //   }));
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateStats, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;