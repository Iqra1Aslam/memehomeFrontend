"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ably, channel } from "../../utils/ablyClient";
import axios from "axios";
const URL = import.meta.env.VITE_API_URL;
const jerkyAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    x: [0, -15, 15, -10, 10, -5, 5, 0],
    y: [0, -10, 10, -5, 5, -3, 3, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1],
      ease: "easeInOut",
    },
  },
  exit: { opacity: 0, y: -20 },
};

// Function to format amount to 4 decimal places
// const formatAmount = (amount: string): string => {
//   const [value, unit] = amount.split(" ");
//   const numValue = parseFloat(value);
//   if (isNaN(numValue)) return amount;
//   return `${numValue.toFixed(4)} ${unit}`;
// };
function formatAmount(amount: string | number | undefined | null): string {
  if (!amount || typeof amount !== "string" && typeof amount !== "number") return "";

  const amountStr = typeof amount === "number" ? amount.toFixed(4) : amount;
  const [integerPart, decimalPart = ""] = amountStr.split(".");

  return (
    integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (decimalPart ? "." + decimalPart.slice(0, 2) : "")
  );
}


// Function to parse market cap (handles both string and number)
const parseMarketCap = (marketCap: string | number): number => {
  if (typeof marketCap === "number") {
    return marketCap;
  }
  if (typeof marketCap !== "string" || !marketCap) {
    console.warn("marketCap is not a valid string or number:", marketCap);
    return 0;
  }
  const cleaned = marketCap.replace("$", "").toLowerCase();
  const value = parseFloat(cleaned.replace(/[km]/, ""));
  return isNaN(value) ? 0 : value;
};

interface Notification {
  id: number;
  tokenName: string;
  tradeType: "bought" | "sold";
  marketCap: string | number;
  amount: string;
}

const NotificationBanner: React.FC = () => {
  const [lastTrade, setLastTrade] = useState<Notification | null>(null);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Fetch SOL price from localStorage
  useEffect(() => {
    const fetchPrice = () => {
      const fetchedPrice = localStorage.getItem("sol-price");
      if (fetchedPrice) {
        setSolPrice(parseFloat(fetchedPrice));
      }
    };
    fetchPrice();
  }, []);
  useEffect(() => {
    const onNewTrade = (message: any) => {
      const trade = message.data;
  
    
      setShouldAnimate(true); // Trigger animation
      console.log("real time trade :",message.data);
      
      // Reset animation flag after a short time
      setTimeout(() => setShouldAnimate(false), 2000);
    };
  
    channel.subscribe("new_trade", onNewTrade);

    return () => {
      channel.unsubscribe("new_trade", onNewTrade);
    };
  }, []);
  

  // Function to save the last trade to localStorage
  const saveLastTradeToLocalStorage = (trade: Notification) => {
    localStorage.setItem("lastTrade", JSON.stringify(trade));
  };

  // Function to load the last trade from localStorage
  const loadLastTradeFromLocalStorage = (): Notification | null => {
    const storedTrade = localStorage.getItem("lastTrade");
    if (storedTrade) {
      try {
        return JSON.parse(storedTrade) as Notification;
      } catch (error) {
        console.error("Error parsing last trade from localStorage:", error);
        return null;
      }
    }
    return null;
  };

  // Fetch initial TradeSuccess record from API, with fallback to localStorage
  useEffect(() => {
    const fetchTradeSuccesses = async () => {
      try {
        const response = await axios.get(
         `${URL}coin/api/trade-success`
        );
        const tradeSuccesses = response.data.tradeSuccesses || [];
        if (tradeSuccesses.length > 0) {
          const latestTrade = tradeSuccesses[0];
          const newTrade: Notification = {
            id: Date.now(),
            tokenName: latestTrade.tokenName,
            tradeType: latestTrade.tradeType,
            marketCap: latestTrade.marketCap,
            amount: latestTrade.amount,
          };
          setLastTrade(newTrade);
          saveLastTradeToLocalStorage(newTrade);
        } else {
          const storedTrade = loadLastTradeFromLocalStorage();
          if (storedTrade) {
            setLastTrade(storedTrade);
          }
        }
      } catch (error) {
        console.error("Error fetching trade successes:", error);
        const storedTrade = loadLastTradeFromLocalStorage();
        if (storedTrade) {
          setLastTrade(storedTrade);
        }
      }
    };
    fetchTradeSuccesses();
  }, []);

  // Set up Ably subscription to update the last trade in real-time
  useEffect(() => {
    const handleTradeSuccess = (message: any) => {
      // console.log("Received trade success message:", message);
      const trade = message.data.tradeSuccess;
      const newTrade: Notification = {
        id: Date.now(),
        tokenName: trade.tokenName,
        tradeType: trade.tradeType,
        marketCap: trade.marketCap,
        amount: trade.amount,
      };
      setLastTrade(newTrade);
      saveLastTradeToLocalStorage(newTrade);
    };

    channel.subscribe("tradeSuccess", handleTradeSuccess);

    return () => {
      channel.unsubscribe("tradeSuccess", handleTradeSuccess);
    };
  }, []);

  if (!lastTrade) {
    return null;
  }

  const displayAmount = formatAmount(lastTrade.amount);
  const parsedMarketCap = parseMarketCap(lastTrade.marketCap);
  const effectivePrice = solPrice > 0 ? solPrice : 1;
  const adjustedMarketCap = ((parsedMarketCap * effectivePrice) / 1000).toFixed(
    2
  );
  const displayMarketCap = `$${adjustedMarketCap}K`;

  return (
    <motion.div
      // key={lastTrade.id}
      // variants={jerkyAnimation}
      // initial="initial"
      // animate="animate"
      key={shouldAnimate ? lastTrade.id : "static"}
      variants={jerkyAnimation}
      initial={shouldAnimate ? "initial" : false}
      animate={shouldAnimate ? "animate" : false}
      exit="exit"
      className="max-w-[400px] w-full h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white py-2 px-3 rounded-lg border border-purple-500/40 shadow-lg shadow-purple-500/10 flex-shrink-0 flex items-center"
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center space-x-1">
          {/* <Sparkles className="w-4 h-4 text-purple-300" /> */}
          {/* <span className="font-semibold text-xs text-purple-100">Trade:</span> */}
          <span className="text-xs truncate">
            <span className="font-medium text-purple-200">
              {lastTrade.tradeType === "bought" ? "Bought" : "Sold"}
            </span>{" "}
            {displayAmount} of {lastTrade.tokenName}
          </span>
        </div>
        <span className="text-xs bg-purple-500/30 text-purple-100 px-1.5 py-0.5 rounded-full">
          MC: {displayMarketCap}
        </span>
      </div>
    </motion.div>
  );
};

export default NotificationBanner;
