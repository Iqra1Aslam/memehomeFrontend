"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface ThreadMessageProps {
  username: string;
  timestamp: string;
  message: string;
}

export const ThreadMessage: React.FC<ThreadMessageProps> = ({
  username,
  timestamp,
  message,
}) => (
  <motion.div
    whileHover={{ x: 2 }}
    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
  >
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-purple-400 border border-purple-500/30">
      <Users size={18} />
    </div>
    <div>
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-purple-400 text-sm font-medium">{username}</span>
        <span className="text-gray-500 text-xs">{timestamp}</span>
      </div>
      <p className="text-white">{message}</p>
    </div>
  </motion.div>
);
