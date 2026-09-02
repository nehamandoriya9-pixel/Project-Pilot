import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsAPI } from '../../services/api';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching projects from API...');
      const response = await projectsAPI.getAll();
      console.log('✅ API Response:', response.data);
      
      // FIX: Return the data directly (should be an array)
      return response.data;
    } catch (error) {
      console.error('❌ API Error, using mock data:', error);
      
      // FIX: Return array directly to match API structure
      return [
        {
          _id: '1',
          name: 'Website Redesign',
          description: 'Complete redesign of company website with modern UI/UX',
          status: 'active',
          startDate: new Date('2024-01-01').toISOString(),
          endDate: new Date('2024-06-01').toISOString(),
          teamMembers: [
            { _id: '1', name: 'John Doe', email: 'john@example.com' },
            { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
          ],
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Mobile App Development',
          description: 'Build cross-platform mobile application',
          status: 'in-progress',
          startDate: new Date('2024-02-01').toISOString(),
          endDate: new Date('2024-08-01').toISOString(),
          teamMembers: [
            { _id: '1', name: 'John Doe', email: 'john@example.com' }
          ],
          createdAt: new Date().toISOString()
        }
      ];
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating project:', projectData);
      const response = await projectsAPI.create(projectData);
      console.log('✅ Project created:', response.data);
      
      // FIX: Return the project directly (not wrapped in object)
      return response.data;
    } catch (error) {
      console.error('❌ Create project error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating project:', id, projectData);
      const response = await projectsAPI.update(id, projectData);
      console.log('✅ Project updated:', response.data);
      
      // FIX: Return the project directly
      return response.data;
    } catch (error) {
      console.error('❌ Update project error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      console.log('🔄 Deleting project:', projectId);
      await projectsAPI.delete(projectId);
      console.log('✅ Project deleted:', projectId);
      return projectId;
    } catch (error) {
      console.error('❌ Delete project error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add this for manual debugging
    setProjects: (state, action) => {
      state.projects = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        console.log('⏳ Fetch projects pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        console.log('✅ Fetch projects fulfilled:', action.payload);
        state.loading = false;
        
        // FIX: Use payload directly (it should be the array)
        state.projects = action.payload || [];
        
        console.log('📊 Projects set in state:', state.projects.length);
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        console.error('❌ Fetch projects rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.projects = []; // Clear projects on error
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: Add the new project directly
        if (action.payload) {
          state.projects.unshift(action.payload);
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        // FIX: Update with the project directly
        if (action.payload) {
          const index = state.projects.findIndex(p => p._id === action.payload._id);
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
      })
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearCurrentProject, clearError, setProjects } = projectSlice.actions;
export default projectSlice.reducer;