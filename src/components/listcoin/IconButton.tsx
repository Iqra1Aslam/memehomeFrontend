import React from "react";
import { motion } from "framer-motion";

interface IconButtonProps {
  icon: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({ icon }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
  >
    {icon}
  </motion.button>
);

export default IconButton;