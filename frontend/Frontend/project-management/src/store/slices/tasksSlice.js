import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksAPI } from '../../services/api';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching tasks from API...');
      const response = await tasksAPI.getAll();
      console.log('✅ API Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ API Error, using mock data:', error);
      
      // Return mock tasks data (not project data)
      return [
        {
          _id: '1',
          title: 'Design Homepage',
          description: 'Create modern homepage design',
          status: 'todo',
          priority: 'high',
          dueDate: new Date('2024-02-15').toISOString(),
          project: { _id: '1', name: 'Website Redesign' },
          assignedTo: { _id: '1', name: 'John Doe' }
        },
        {
          _id: '2',
          title: 'API Integration',
          description: 'Integrate third-party APIs',
          status: 'in-progress',
          priority: 'medium',
          dueDate: new Date('2024-02-20').toISOString(),
          project: { _id: '2', name: 'Mobile App' },
          assignedTo: { _id: '2', name: 'Jane Smith' }
        }
      ];
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating task:', taskData);
      const response = await tasksAPI.create(taskData);
      console.log('✅ Task created:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Create task error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating task:', id, taskData);
      const response = await tasksAPI.update(id, taskData);
      console.log('✅ Task updated:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Update task error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

// FIX: Changed from 'deletetask' to 'deleteTask'
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      console.log('🔄 Deleting task:', taskId);
      await tasksAPI.delete(taskId);
      console.log('✅ Task deleted:', taskId);
      return taskId;
    } catch (error) {
      console.error('❌ Delete task error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add this for manual debugging
    setTasks: (state, action) => {
      state.tasks = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks - FIX: Use correct case
      .addCase(fetchTasks.pending, (state) => {
        console.log('⏳ Fetch tasks pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        console.log('✅ Fetch tasks fulfilled:', action.payload);
        state.loading = false;
        
        // Use payload directly (it should be the array)
        state.tasks = action.payload || [];
        
        console.log('📊 Tasks set in state:', state.tasks.length);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        console.error('❌ Fetch tasks rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.tasks = []; // Clear tasks on error
      })
      // Create Task - FIX: Use correct case
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new task directly
        if (action.payload) {
          state.tasks.unshift(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Task - FIX: Use correct case
      .addCase(updateTask.fulfilled, (state, action) => {
        // Update with the task directly
        if (action.payload) {
          const index = state.tasks.findIndex(t => t._id === action.payload._id);
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        }
      })
      // Delete Task - FIX: Use correct case
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      });
  },
});

// FIX: Export with correct casing
export const { clearCurrentTask, clearError, setTasks } = tasksSlice.actions;
export default tasksSlice.reducer;