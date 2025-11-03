// hooks/useProject.js - Fixed version
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import {
  clearCurrentProject,
  clearError,
  createProject,
  updateProject,
  fetchProjects,
  deleteProject,
} from "../store/slices/projectsSlice";

export const useProject = () => {
  const dispatch = useDispatch();
  const projectsState = useSelector((state) => state.projects || {
    projects: [],
    loading: false,
    error: null,
    currentProject: null,
  });

  const getProjects = useCallback(() => {
    dispatch(fetchProjects()); // Fixed: added parentheses
  }, [dispatch]);

  const addProject = useCallback((projectData) => {
    return dispatch(createProject(projectData));
  }, [dispatch]);

  const removeProject = useCallback((id) => { // Fixed parameter
    return dispatch(deleteProject(id));
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    return dispatch(clearCurrentProject());
  }, [dispatch]);

  const editProject = useCallback((id, projectData) => { // Fixed parameters
    return dispatch(updateProject({ id, projectData }));
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    return dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  return {
    projects: projectsState.projects || [],
    currentProject: projectsState.currentProject,
    loading: projectsState.loading,
    error: projectsState.error,
    getProjects,
    addProject,
    editProject,
    clearCurrentProject: clearCurrent,
    clearError: clearErrors,
    removeProject,
  };
};

export default useProject;