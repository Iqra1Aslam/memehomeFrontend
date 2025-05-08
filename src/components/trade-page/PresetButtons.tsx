import React from "react";
import { AmountButton } from "./ui/amount-button";

interface PresetButtonsProps {
  isBuyActive: boolean;
  handlePresetAmount: (value: string) => void;
  balance: number;
  tokenBalance: number;
  isEagleMode: boolean;
  ticker: string | undefined;
}

export const PresetButtons: React.FC<PresetButtonsProps> = ({
  isBuyActive,
  handlePresetAmount,
  balance,
  tokenBalance,
  isEagleMode,
  ticker,
}) => (
  <div className="flex flex-wrap gap-2 mb-4">
    <AmountButton label="reset" onClick={() => handlePresetAmount("0")} />

    {/* Buy mode presets */}
    {isBuyActive ? (
      isEagleMode ? (
        // Buy + Eagle mode: Token presets
        <>
          <AmountButton
            label={`10% ${ticker || "TOKEN"}`}
            onClick={() => handlePresetAmount((tokenBalance / 10).toString())}
          />
          <AmountButton
            label={`25% ${ticker || "TOKEN"}`}
            onClick={() => handlePresetAmount((tokenBalance / 4).toString())}
          />
          <AmountButton
            label={`50% ${ticker || "TOKEN"}`}
            onClick={() => handlePresetAmount((tokenBalance / 2).toString())}
          />
          <AmountButton
            label="max"
            onClick={() => handlePresetAmount(tokenBalance.toString())}
          />
        </>
      ) : (
        // Buy + SOL mode: SOL presets
        <>
          <AmountButton
            label="0.1 SOL"
            onClick={() => handlePresetAmount("0.1")}
          />
          <AmountButton
            label="0.5 SOL"
            onClick={() => handlePresetAmount("0.5")}
          />
          <AmountButton label="1 SOL" onClick={() => handlePresetAmount("1")} />
          <AmountButton
            label="max"
            onClick={() => handlePresetAmount(balance.toString())}
          />
        </>
      )
    ) : (
      // Sell mode always uses token presets (regardless of isEagleMode)
      <>
        <AmountButton
          label={`10% ${ticker || "TOKEN"}`}
          onClick={() => handlePresetAmount((tokenBalance / 10).toString())}
        />
        <AmountButton
          label={`25% ${ticker || "TOKEN"}`}
          onClick={() => handlePresetAmount((tokenBalance / 4).toString())}
        />
        <AmountButton
          label={`50% ${ticker || "TOKEN"}`}
          onClick={() => handlePresetAmount((tokenBalance / 2).toString())}
        />
        <AmountButton
          label="max"
          onClick={() => handlePresetAmount(tokenBalance.toString())}
        />
      </>
    )}
  </div>
);
