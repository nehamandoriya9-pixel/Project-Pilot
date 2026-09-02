import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  TbLayoutSidebarRightCollapse,
  TbLayoutDashboard 
} from "react-icons/tb";
import { DiYii } from "react-icons/di";
import { 
  MdInsertDriveFile
} from "react-icons/md";
import { BiTask } from "react-icons/bi";
import { RiTeamFill } from "react-icons/ri";
import { ImProfile } from "react-icons/im";
import { 
  IoSettingsOutline,
  IoAddCircleOutline
} from "react-icons/io5";
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <TbLayoutDashboard className='h-5 w-5'/>,
      description: 'Overview'
    },
    {
      path: '/dashboard/projects',
      name: 'Projects',
      icon: <MdInsertDriveFile className='h-5 w-5'/>,
      description: 'Manage Projects'
    },
    {
      path: '/dashboard/tasks',
      name: 'Tasks',
      icon: <BiTask className='h-5 w-5'/>,
      description: 'View All Tasks'
    },
    {
      path: '/dashboard/team',
      name: 'Team',
      icon: <RiTeamFill className='h-5 w-5' />,
      description: 'Team Members'
    },
    {
      path: '/dashboard/profile',
      name: 'Profile',
      icon: <ImProfile className='h-5 w-5'/>,
      description: 'Your Profile'
    },
    // {
    //   path: '/dashboard/settings',
    //   name: 'Settings',
    //   icon: <IoSettingsOutline className='h-5 w-5'/>,
    //   description: 'Preferences'
    // }
  ];

  const quickActions = [
    {
      path: '/dashboard/projects/new',
      name: 'New Project',
      icon: <IoAddCircleOutline className="h-4 w-4" />
    },
    {
      path: '/dashboard/tasks/new',
      name: 'New Task',
      icon: <IoAddCircleOutline className="h-4 w-4" />
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <div className={`
        w-64 h-full flex flex-col
        ${isDarkMode 
          ? "bg-gray-950 border-r border-gray-800 text-gray-100" 
          : "bg-white border-r border-gray-200 text-gray-800"
        }
      `}>
        
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDarkMode 
                ? "bg-gradient-to-br from-blue-600 to-purple-600" 
                : "bg-gradient-to-br from-blue-500 to-purple-500"
            }`}>
              <DiYii  className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                ProjectPilot
              </h2>
              <p className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Workspace
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`lg:hidden p-1 rounded transition-colors ${
              isDarkMode 
                ? "hover:bg-gray-800 text-gray-400" 
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <TbLayoutSidebarRightCollapse className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  // onClick={onClose}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? isDarkMode 
                        ? "bg-blue-500/10 text-blue-400" 
                        : "bg-blue-50 text-blue-600"
                      : isDarkMode
                        ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r ${
                      isDarkMode ? "bg-blue-400" : "bg-blue-500"
                    }`} />
                  )}
                  
                  <span className={`transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}>
                    {item.icon}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      isActive ? "text-current" : "group-hover:text-current"
                    }`}>
                      {item.name}
                    </div>
                    <div className={`text-xs ${
                      isActive 
                        ? isDarkMode ? "text-blue-300/80" : "text-blue-500/70"
                        : isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Actions & Footer */}
          <div className="p-3 space-y-3 border-t border-gray-200 dark:border-gray-800">
            {/* Quick Actions */}
            <div className={`rounded-lg p-3 ${
              isDarkMode 
                ? "bg-gray-800/50" 
                : "bg-gray-50"
            }`}>
              <h3 className={`text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <NavLink
                    key={action.path}
                    to={action.path}
                    className={`
                      flex items-center space-x-2 p-2 rounded text-sm font-medium transition-all duration-200
                      ${isDarkMode 
                        ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700/50" 
                        : "text-gray-600 hover:text-blue-600 hover:bg-white"
                      }
                    `}
                    onClick={onClose}
                  >
                    <span className={`p-1 rounded ${
                      isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10"
                    }`}>
                      {action.icon}
                    </span>
                    <span>{action.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={`text-center pt-2 ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}>
              <p className="text-xs">
                ProjectPilot v2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;