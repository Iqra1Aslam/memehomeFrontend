import React from "react";
import { motion } from "framer-motion";
import { Info, TrendingDown, TrendingUp } from "lucide-react";

interface ProgressBarProps {
  title: string;
  progress: number;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  description?: string;
  msg?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  progress,
  gradientFrom,
  gradientTo,
  shadowColor,
  description,
  msg,
}) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 text-sm">{title}:</span>

        {title.includes("Bonding") && (
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="cursor-help"
            title="Bonding curve determines token price based on supply"
          >
            <Info size={14} className="text-blue-400" />
          </motion.div>
        )}
      </div>

      <motion.span
        key={progress}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white text-sm font-semibold"
      >
        {progress.toFixed(2)}%
      </motion.span>
    </div>
    <span className="text-gray-400 text-sm">{msg}</span>
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${progress.toFixed(2)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} shadow-sm ${shadowColor}`}
      />
    </div>
    {title.includes("Bonding") ? (
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <TrendingDown size={12} className="text-blue-400" />
          <span>Lower price</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <TrendingUp size={12} className="text-cyan-400" />
          <span>Higher price</span>
        </div>
      </div>
    ) : (
      description && <p className="text-gray-500 text-xs mt-1">{description}</p>
    )}
  </div>
);
