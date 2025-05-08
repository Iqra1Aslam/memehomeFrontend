"use client";

import type React from "react";
import { motion } from "framer-motion";

interface AmountButtonProps {
  label: string;
  onClick: () => void;
}

export const AmountButton: React.FC<AmountButtonProps> = ({
  label,
  onClick,
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-3 py-1 rounded-lg bg-gray-800/80 text-gray-400 text-sm hover:bg-gray-700/80 hover:text-gray-300 transition-colors border border-gray-700/50"
  >
    {label}
  </motion.button>
);
