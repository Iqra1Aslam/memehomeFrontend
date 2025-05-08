import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PublicKey } from "@solana/web3.js";

interface TradeButtonProps {
  isTrading: boolean;
  isBuyActive: boolean;
  publicKey: PublicKey | null;
  handleTrade: (value: number) => void;
  amount: string;
  calculatedAmount: number;
  isEagleMode: boolean;
}

export const TradeButton: React.FC<TradeButtonProps> = ({
  isTrading,
  isBuyActive,
  publicKey,
  handleTrade,
  amount,
  calculatedAmount,
  isEagleMode,
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => handleTrade(isEagleMode ? calculatedAmount : Number(amount))}
    disabled={isTrading || !publicKey}
    className={`w-full py-4 rounded-xl text-white flex items-center justify-center space-x-2 mb-4 ${
      isBuyActive
        ? "bg-gradient-to-r from-green-500 to-green-400"
        : "bg-gradient-to-r from-red-500 to-red-400"
    } ${isTrading || !publicKey ? "opacity-75 cursor-not-allowed" : ""}`}
  >
    {isTrading ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-t-transparent border-white rounded-full"
      />
    ) : (
      <>
        <Sparkles size={18} />
        <span>Place Trade</span>
      </>
    )}
  </motion.button>
);