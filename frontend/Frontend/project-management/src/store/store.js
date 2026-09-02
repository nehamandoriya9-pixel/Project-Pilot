import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./slices/authSlice"
import projectsReducer from "./slices/projectsSlice"
import dashboardReducer from "./slices/dashboardSlice"

export const store = configureStore({
  reducer: {
  auth: authReducer,
  projects: projectsReducer,
  dashboard: dashboardReducer

 
  },
})

export default store;