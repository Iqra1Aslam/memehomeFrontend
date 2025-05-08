import React from "react";
import { motion } from "framer-motion";

interface FilterButtonProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, text, active }) => (
  <motion.button
    // whileHover={{ scale: 1.05 }}
    // whileTap={{ scale: 0.95 }}
    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs ${
      active
        ? "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white"
        : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
    } transition-colors`}
  >
    {icon}
    <span>{text}</span>
  </motion.button>
);

export default FilterButton;
