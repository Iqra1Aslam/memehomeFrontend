
import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

import { ably } from "../../utils/ablyClient";
interface Coin {
  _id: string;
  name: string;
  ticker: string;
  imgUrl: string;
  marketCap: number;
  creator: {
    wallet: string;
  };
  description: string;
  date: string;
}

interface CoinCardProps {
  coin: Coin;
  onTradeClick: () => void;
  price: number | null;
  isShuffling: boolean;
  replyCount?: number;
}

const CoinCard: React.FC<CoinCardProps> = ({
  coin,
  onTradeClick,
  price,
  isShuffling,
}) => {
  // const URL = process.env.VITE_API_URL;
  const URL = import.meta.env.VITE_API_URL;
  const [replyCount, setReplyCount] = useState<number>(0);

  // Fetch the reply count from localStorage when the component mounts
  useEffect(() => {
    const fetchReplyCount = async () => {
      try {
        // console.log(`${URL}coin/reply-count/${coin.token}`)
        const response = await axios.get(
          `${URL}coin/reply-count/${coin.token}`
        );

        setReplyCount(response.data.replyCount);
      } catch (error) {
        console.error("Error fetching reply count:", error);
      }
    };

    fetchReplyCount();
    const channel = ably.channels.get(`reply-count-${coin.token}`);

    channel.subscribe("reply-count", (message) => {
      setReplyCount(message.data.replyCount);
      //   }
    });
    return () => {
      channel.unsubscribe();
    };
  }, [coin.token]);
  const truncateCreator = (wallet: string, maxLength: number = 30) => {
    if (!wallet) return "Unknown Creator";
    if (wallet.length <= maxLength) return wallet;
    return wallet.substring(0, maxLength) + "...";
  };

  const timeAgo = getTimeAgo(coin.date);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (isShuffling: boolean) => ({
      opacity: 1,
      y: 0,
      x: isShuffling ? [0, -10, 10, -10, 10, 0] : 0,
      transition: {
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        x: isShuffling
          ? {
              duration: 0.3,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              ease: "easeInOut",
            }
          : { duration: 0 },
      },
    }),
    hover: { y: -5 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <motion.div
      onClick={onTradeClick}
      initial="initial"
      animate="animate"
      exit="exit"
 
      variants={cardVariants}
      custom={isShuffling}
      className={`group relative rounded-xl overflow-hidden w-full border ${
        isShuffling
          ? "border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          : "border-purple-500/20 hover:border-purple-500/40"
      } transition-all hover-glow backdrop-blur-sm`}
      style={{
        background: isShuffling
          ? "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))"
          : "transparent",
      }}
    >
      {/* Left side - Image */}
      <div className="flex">
        <div className="relative w-24 h-24 flex-shrink-0 mt-3">
          <img
            src={coin.imgUrl}
            alt={coin.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-indigo-500 transition-all">
                {coin.name}{" "}
                <span className="text-gray-400">({coin.ticker})</span>
              </h3>
            </div>
            <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs whitespace-nowrap">
              ${((coin.marketCap * (price ?? 164.91)) / 1000).toFixed(2)}K
            </span>
          </div>

          <p className="text-white/80 text-xs mb-3 break-words">
            replies: <span>{replyCount || 0}</span>
          </p>

          <p className="text-white/80 text-xs mb-3 break-words">
            {coin.description}
          </p>

          <div className="flex flex-col gap-1 text-xs">
            <div className="text-gray-400">Created {timeAgo}</div>
            <div className="text-gray-400">
              By{" "}
              <span className="text-purple-400">
                {coin.creator?.wallet
                  ? truncateCreator(coin.creator.wallet)
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </motion.div>
  );
};

export default CoinCard;
