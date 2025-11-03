// App.jsx - Fixed routing
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Screens/Dashboard";
import Projects from "./Pages/Projects";
import DashboardHome from "./components/Screens/DashboardHome";
import ProjectDetails from "./Pages/ProjectDetails";
import CreateProject from "./Pages/CreateProject";
import EditProject from "./Pages/EditProject";
import Tasks from "./Pages/Tasks";
import CreateTask from "./Pages/CreateTask";
import TaskDetails from "./Pages/TaskDetails";
import EditTasks from "./Pages/EditTasks";
import Profile from "./Pages/Profile";
// import Team from "../../../backend/src/models/Team";
import Teams from "./Pages/Teams";
import { Toaster } from 'react-hot-toast';


function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return !token ? children : <Navigate to="/dashboard" />;
  };

  return (
    <div className="App">
      
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Dashboard Layout Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="projects/:id/edit" element={<EditProject />} />

          <Route path="tasks"  element={<Tasks />} />
          <Route path="tasks/new" element={<CreateTask />} />
          <Route path="tasks/:id/edit" element={<EditTasks />} />
          <Route path="tasks/:id" element={<TaskDetails />} />

          <Route path="profile" element={<Profile />} />

          <Route path="team" element={<Teams />} />
          <Route path="team/:teamId" element={<Teams />} />
          


        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;