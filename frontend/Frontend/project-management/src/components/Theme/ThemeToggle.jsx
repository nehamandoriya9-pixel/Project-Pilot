// components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaRegLightbulb } from "react-icons/fa6";
import { FaLightbulb } from "react-icons/fa6";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        isDarkMode 
          ? "bg-neutral-800 hover:bg-neutral-700 text-white" 
          : "bg-red-200 hover:bg-red-300 text-amber-700"
      }`}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FaRegLightbulb className="h-5 w-5 text-yellow-400" />
      ) : (
        <FaLightbulb className="h-5 w-5 text-amber-800" />
      )}
    </button>
  );
};

export default ThemeToggle;