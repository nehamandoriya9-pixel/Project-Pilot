// hooks/useDashboard.js - FIXED VERSION
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { fetchDashboardData } from "../store/slices/dashboardSlice";

const useDashboard = () => {
  const dispatch = useDispatch();
  
  // Fix: Use the correct state path - check your Redux store structure
  const dashboard = useSelector((state) => state.dashboard || {
    stats: {
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0
    },
    recentProjects: [],
    recentTasks: [],
    loading: false,
    error: null
  });

  const getDashboardData = useCallback(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  // Provide default values to prevent undefined errors
  return {
    stats: dashboard.stats || {
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0
    },
    recentProjects: dashboard.recentProjects || [],
    recentTasks: dashboard.recentTasks || [],
    loading: dashboard.loading || false,
    error: dashboard.error || null,
    refreshData: getDashboardData,
  };
};

export default useDashboard;