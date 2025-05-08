import React from "react";

interface AmountInputProps {
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEagleMode: boolean;
  ticker: string | undefined;
  max?: number;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  handleAmountChange,
  isEagleMode,
  ticker,
  max
 
}) => (
  <div className="relative mb-4">
    <input
      type="text"
      value={amount}
      onChange={handleAmountChange}

      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white"
      max={max}
      placeholder={isEagleMode ? `${ticker || "Token"} amount` : "SOL amount"}
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
      {isEagleMode ? ticker || "TOKEN" : "SOL"}
    </span>
  </div>
);
