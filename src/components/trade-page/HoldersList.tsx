import React from "react";
import { motion } from "framer-motion";
import { Home, Box } from "lucide-react"; // Removed unused icons (User, Wallet, PieChart)

interface Holder {
  address: string;
  percentage: string;
  fullAddress: string;
}

interface HoldersListProps {
  holders: Holder[];
  isLoading: boolean;
  bondingCurve?: string;
  creatorWallet?: string;
}

export const HoldersList: React.FC<HoldersListProps> = ({
  holders,
  isLoading,
  bondingCurve,
  creatorWallet,
}) => {
  // Only show icons for bonding curve and creator
  const getHolderIcon = (fullAddress: string) => {
    if (bondingCurve === fullAddress)
      return <Box size={14} className="text-blue-400" />;
    if (creatorWallet === fullAddress)
      return <Home size={14} className="text-green-400" />;
    return null; // No icon for other addresses
  };

  return (
    <>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">Holder distribution</h4>
        </div>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-t-transparent border-purple-400 rounded-full"
            />
          </div>
        ) : holders.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-2">
            No holders found
          </div>
        ) : (
          holders.map((holder, index) => {
            const isBondingCurve = bondingCurve === holder.fullAddress;
            const isCreator = creatorWallet === holder.fullAddress;

            return (
              <motion.div
                key={holder.fullAddress}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{index + 1}.</span>
                  <div className="flex items-center space-x-2">
                    {getHolderIcon(holder.fullAddress)}
                    <a
                      href={`https://explorer.solana.com/address/${holder.fullAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-purple-400 transition-colors"
                    >
                      {holder.address}
                    </a>
                    {(isBondingCurve || isCreator) && (
                      <span className="text-xs text-gray-500">
                        {isBondingCurve && "(Bonding Curve)"}
                        {isCreator && "(Creator)"}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                      ? "text-purple-400"
                      : "text-gray-400"
                  }`}
                >
                  {holder.percentage}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </>
  );
};
