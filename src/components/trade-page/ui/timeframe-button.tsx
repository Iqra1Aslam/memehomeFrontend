"use client";

import type React from "react";
import { motion } from "framer-motion";

interface TimeframeButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

export const TimeframeButton: React.FC<TimeframeButtonProps> = ({
  active,
  onClick,
  label,
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-3 py-1 rounded-lg text-sm ${
      active
        ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
        : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent"
    } transition-all`}
  >
    {label}
  </motion.button>
);
