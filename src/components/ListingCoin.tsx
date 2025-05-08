import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css";
import CoinCard from "./listcoin/CoinCard";
import LoadingSpinner from "./listcoin/LoadingSpinner";
import SortDropdown from "./listcoin/SortDropdown";

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

interface ListingCoinProps {
  onTradeClick: (coin: Coin) => void;
  coins: Coin[];
  price: number | null;
}

const ITEMS_PER_PAGE = 25;

const ListingCoin: React.FC<ListingCoinProps> = ({
  onTradeClick,
  coins,
  price,
}) => {
  const [shufflingCardId, setShufflingCardId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("Creation Time");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleDataLoad = useCallback(() => {
    // console.log('Handling data load, coins length:', coins?.length);
    setIsLoading(true);
    setTimeout(() => {
      // console.log('Loading complete');
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // console.log('Coins received:', coins);
    // console.log('Price:', price);
    handleDataLoad();

    if (!coins || coins.length === 0) {
      return;
    }

    const shuffleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * coins.length);
      const randomCardId = coins[randomIndex]._id;
      setShufflingCardId(randomCardId);
      setTimeout(() => setShufflingCardId(null), 500);
    }, 3000);

    return () => clearInterval(shuffleInterval);
  }, [coins, handleDataLoad]);

  // Adjusted filter to use marketCap directly with a higher threshold
  const regularCoins =
    coins?.filter((coin) => {
      // console.log(`${coin.name}: Market Cap = ${coin.marketCap}`);
      return coin.marketCap <= 10000; // Adjust this threshold based on your needs
    }) || [];

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedRegularCoins = regularCoins.slice(startIndex, endIndex);
  const totalPages = Math.ceil(regularCoins.length / ITEMS_PER_PAGE);

  const filteredDisplayedCoins = displayedRegularCoins
    .filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "Creation Time":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "Market Cap":
          return b.marketCap - a.marketCap;
        case "Last Trade":
          return 0;
        default:
          return 0;
      }
    });

  const handleSortChange = (option: string) => setSortOption(option);
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSearchQuery("");
      setSortOption("Creation Time");
      handleDataLoad();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSearchQuery("");
      setSortOption("Creation Time");
      handleDataLoad();
    }
  };

  if (!coins) {
    return (
      <div className="bg-black py-8 px-4 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-black py-8 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500">
              Trending Tokens
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              Discover the hottest meme tokens on Solana
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 rounded-full bg-white/10 border border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm text-sm"
            />
            <SortDropdown onSortChange={handleSortChange} />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : regularCoins.length === 0 ? (
          <div className="text-gray-400 text-center min-h-[400px] flex items-center justify-center">
            No tokens found matching your criteria
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredDisplayedCoins.map((coin) => (
                  <motion.div key={coin._id} layout className="w-full">
                    <CoinCard
                      coin={coin}
                      onTradeClick={() => onTradeClick(coin)}
                      price={price}
                      isShuffling={shufflingCardId === coin._id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${
                  currentPage === 1
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${
                  currentPage === totalPages
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListingCoin;
