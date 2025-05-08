import React, { useEffect, useRef,useState } from "react";
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import CoinCard from "./CoinCard";
import bg from "../assests/meme.webp";
import "../index.css";
import { ably, channel } from "../utils/ablyClient";

interface Creator {
  _id: string;
  name: string;
  wallet: string;
  avatar: string;
  __v: number;
}

interface Coin {
  _id: string;
  name: string;
  ticker: string;
  imgUrl: string;
  marketCap: number;
  creator: Creator;
  description: string;
  holders: number;
  volume24h: string;
  price: string;
  change24h: string;
  date: string;
}

interface HeroSectionProps {
  onCreateClick: () => void;
  topCoin: Coin | null;
  price: number | null;
  onTradeClick: (coin: Coin) => void;
  onSearch: (query: string) => void;
  highMarketCapCoins: Coin[];
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onCreateClick,
  topCoin,
  price,
  onTradeClick,
  onSearch,
  highMarketCapCoins,
}) => {
  const controls = useAnimationControls();
  const x = useMotionValue(0); // Start at 0
  const animationFrameRef = useRef<number | null>(null);
  const [isTradeIncoming, setIsTradeIncoming] = useState(false); // NEW STATE

 
  // Calculate the total width of the cards
  const cardWidth = 320; // w-80 (320px) as defined in the card container
  const cardMargin = 16; // mx-4 (4 * 4 = 16px total margin per card)
  const totalCardWidth = cardWidth + cardMargin; // Total width per card including margin
  const totalCards = highMarketCapCoins.length || 1;
  // console.log("total cards: ", totalCards);
  const totalWidth = totalCards * totalCardWidth; // Total width of all cards (excluding duplicates)
  // console.log("total width: ", totalWidth);
  // Duplicate the cards enough times to ensure the viewport is always filled
  const viewportWidth = 1280; // Approximate max width of the container (max-w-7xl)
  const minDuplicates = Math.ceil(viewportWidth / totalWidth) + 1; // Ensure enough duplicates to fill the viewport
  const duplicatedCards = Array(minDuplicates).fill(highMarketCapCoins).flat(); // Create multiple sets of cards
  // ✅ Handle new trade animation trigger
  useEffect(() => {
    if (!channel) return;

    const onNewTrade = (message: any) => {
      const tradeData = message.data;

      // Trigger temporary visual effect on new trade
      setIsTradeIncoming(true);
  console.log("setIsTradeIncoming",setIsTradeIncoming);
      // Clear effect after 2s
      setTimeout(() => setIsTradeIncoming(false), 2000);
    };

    channel.subscribe("new_trade", onNewTrade);

    return () => {
      channel.unsubscribe("new_trade", onNewTrade);
    };
  }, []);

  useEffect(() => {
    if (isTradeIncoming) {
    let lastTime: number | null = null;
    const speed = 1; // Pixels per frame (adjust for speed)

    const animate = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
      }

      const deltaTime = time - lastTime;
      lastTime = time;

      // Calculate the new x position
      const currentX = x.get();
      const newX = currentX - (speed * deltaTime) / 16; // Normalize speed based on 60fps (16ms per frame)

      // If the x position goes beyond the total width of the original card set,
      // reset it to 0 to create a seamless loop
      if (newX <= -totalWidth) {
        x.set(newX + totalWidth); // Reset to the equivalent position in the next loop
      } else {
        x.set(newX);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }
  }, [isTradeIncoming,x, totalWidth]);

  const handleMouseEnter = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current); // Pause the animation
    }
  };
  const handleMouseLeave = () => {
    let lastTime: number | null = null;
    const speed = 1; // Pixels per frame (adjust for speed)

    const animate = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
      }

      const deltaTime = time - lastTime;
      lastTime = time;

      // Calculate the new x position
      const currentX = x.get();
      const newX = currentX - (speed * deltaTime) / 16; // Normalize speed based on 60fps (16ms per frame)

      // If the x position goes beyond the total width of the original card set,
      // reset it to 0 to create a seamless loop
      if (newX <= -totalWidth) {
        x.set(newX + totalWidth); // Reset to the equivalent position in the next loop
      } else {
        x.set(newX);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Resume the animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  // console.log("High Market Cap Coins:", highMarketCapCoins);
  
  return (
    <div
      className="relative min-h-[300px] bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
      <div className="relative max-w-7xl mx-auto pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Trending Coins Title */}
          <h2 className="text-3xl font-bold text-white mb-6">Trending Coins</h2>

          {highMarketCapCoins.length > 0 && isTradeIncoming && (
            <motion.div
              className="mt-12 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                style={{ x }} // Bind the x position to the motion value
                className="flex whitespace-nowrap"
              >
                {/* Render duplicated cards */}
                {duplicatedCards.map((coin, index) => (
                  
                  <div
                    key={`${coin._id}-${index}`}
                    className="mx-4 flex-shrink-0 w-80 z-50"
                  >
                    <CoinCard
                      coin={coin}
                      onTradeClick={() => onTradeClick(coin)}
                      price={price}
                    />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
