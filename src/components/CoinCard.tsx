import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { ably } from "../utils/ablyClient";

const URL = process.env.VITE_API_URL || "http://localhost:8000/";

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

interface Coin {
  _id: string;
  name: string;
  ticker: string;
  imgUrl: string;
  marketCap: number;
  description: string;
  holders: number;
  volume24h: string;
  price: string;
  change24h: string;
  date: string;
  isCrown: boolean;
}

interface CoinCardProps {
  coin: Coin;
  onTradeClick: () => void;
  price: number | null;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, onTradeClick, price }) => {
  const [replyCount, setReplyCount] = useState<number>(0);
  const timeAgo = getTimeAgo(coin.date);
 

  // Optional: Programmatically truncate description to a max length
  const maxDescriptionLength = 50;
  const truncatedDescription =
    coin.description.length > maxDescriptionLength
      ? `${coin.description.slice(0, maxDescriptionLength)}...`
      : coin.description;

  useEffect(() => {
    const fetchReplyCount = async () => {
      try {
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
      //  console.log(message.data);
      setReplyCount(message.data.replyCount);
    });
    return () => {
      channel.unsubscribe();
    };
  }, [coin.token]);

  return (
    <div
      onClick={onTradeClick}
      className="relative min-w-[280px] w-full bg-black/90 border-2 border-yellow-400/80 rounded-lg flex items-center hover:cursor-pointer"
    >
      {/* Left side - Image */}
      <div className="relative w-[70px] h-[70px] flex-shrink-0 m-2">
        <img
          src={coin.imgUrl}
          alt={coin.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Content */}
      <div className="flex-1 p-2 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-white truncate">
            {coin.name} <span className="text-gray-400">({coin.ticker})</span>
          </h3>
          <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-small">
            ${((coin.marketCap * (price ?? 164.91)) / 1000).toFixed(2)}K
          </span>
        </div>
        {/* Description and Created time stacked below the name */}
        <div className="flex flex-col items-start w-full">
          <p className="text-gray-400 text-xs truncate w-full text-left">
            {truncatedDescription}
          </p>
          <p className="text-xs">
            replies: <span>{replyCount || 0}</span>
          </p>
          <div className="text-gray-400 text-xs mt-0.5 text-left">
            Created {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinCard;
