"use client";

import type React from "react";
import { motion } from "framer-motion";

interface ChartButtonProps {
  icon: React.ReactNode;
}

export const ChartButton: React.FC<ChartButtonProps> = ({ icon }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-purple-500/20"
  >
    {icon}
  </motion.button>
);
