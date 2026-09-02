import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  loginUser,
  clearError,
  getCurrentUser,
  registerUser,
  logout,
  update,
} from "../store/slices/authSlice";


const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.useAuth);

  const login = useCallback(
    (email, password) => {
      return dispatch(loginUser({ email, password }));
    },
    [dispatch]
  );

  const register = useCallback(
    (name, email, password) => {
      return dispatch(registerUser({ name, email, password }));
    },
    [dispatch]
  );

  const AuthError = useCallback(() => {
    return dispatch(clearError());
  }, [dispatch]);

  const fetchCurrentUser = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  const signout = useCallback(() => {
    return dispatch(logout());
  }, [dispatch]);

  const updateUserData = useCallback(
    (userData) => {
      return dispatch(update(userData));
    },
    [dispatch]
  );

  return {
    currentUser: auth.currentUser,
    token: auth.token,
    isAuthenticate: auth.isAuthenticate,
    loading: auth.loading,
    error: auth.error,

    register,
    login,
    fetchCurrentUser,
    logout: signout,
    update: updateUserData,
    clearError: AuthError
  };
};

export default useAuth;
