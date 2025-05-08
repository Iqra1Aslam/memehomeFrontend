import React from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface TradeModeSwitchProps {
  isEagleMode: boolean;
  handleSwitchMode: () => void;
  ticker: string | undefined;
}

export const TradeModeSwitch: React.FC<TradeModeSwitchProps> = ({
  isEagleMode,
  handleSwitchMode,
  ticker,
}) => (
  <motion.button
    className="text-sm text-purple-400 flex items-center space-x-1"
    onClick={handleSwitchMode}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <RefreshCw size={14} />
    <span>{isEagleMode ? "Switch to SOL" : `Switch to ${ticker || "TOKEN"}`}</span>
  </motion.button>
);