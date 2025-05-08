"use client";

import type React from "react";
import { motion } from "framer-motion";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  color: "green" | "purple";
}

export const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  label,
  color,
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-4 py-2 rounded-lg text-sm ${
      active
        ? color === "green"
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
        : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent"
    } transition-all whitespace-nowrap`}
  >
    {label}
  </motion.button>
);
