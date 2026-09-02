// hooks/useTask.js - ENHANCED VERSION
import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../services/api';

export const useTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks function
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getAll();
      setTasks(response.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.error || 'Failed to fetch tasks');
      setTasks([]); // Reset tasks on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh tasks manually
  const refreshTasks = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add a new task
  const addTask = async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      setTasks(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  // Update a task
  const updateTask = async (id, taskData) => {
    try {
      const response = await tasksAPI.update(id, taskData);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data : task
      ));
      return response.data;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks, // Export refresh function
    addTask,
    updateTask,
    deleteTask,
    fetchTasks
  };
};