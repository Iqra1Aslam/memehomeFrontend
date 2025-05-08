


"use client";
import type React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TabButton } from "./ui/tab-button";
import { ThreadMessage } from "./ui/thread-message";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ChevronRight, ChevronLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { channel, ably } from "../../utils/ablyClient"

const URL = import.meta.env.VITE_API_URL;
interface Trade {
  account: string;
  type: "buy" | "sell";
  tokenAmount: number;
  solAmount: number;
  txHex: string;
  tokenAddress: string;
  timestamp: string;
}

interface ThreadSectionProps {
  activeTab: "thread" | "trades";
  setActiveTab: (tab: "thread" | "trades") => void;
  tokenName: string;
  trades?: Trade[];
  tokenAddress?: string;
}

const ThreadSection: React.FC<ThreadSectionProps> = ({
  activeTab,
  setActiveTab,
  tokenName,
  trades = [],
  tokenAddress,
}) => {
  const [fetchedTrades, setFetchedTrades] = useState<Trade[]>(trades);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [coinId, setCoinId] = useState(null);
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coins, setCoins] = useState([]);
  const [replyCount, setReplyCount] = useState<number>(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [value, setValue] = useState(0);
  const replyCountRef = useRef<{ [token: string]: number }>({});
  const [msg, setMsg] = useState("");
  const scrollRef = useRef(null);
  const wallet = useWallet();
  const publickey = wallet.publicKey;

  const truncateAddress = (address: string) =>
    `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;

  const formatTokenAmount = (amount: number): string => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}k`;
    return amount.toString();
  };

  const formatSolAmount = (amount: number): string => amount.toFixed(4);

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const tradeTime = new Date(timestamp);
    const diffSec = Math.floor((now.getTime() - tradeTime.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
    return `${Math.floor(diffSec / 86400)} day${diffSec >= 172800 ? "s" : ""} ago`;
  };

  const fetchTrades = async () => {
    if (!tokenAddress) {
      // console.log("No tokenAddress provided for fetching trades");
      setFetchedTrades(trades);
      return;
    }
    setIsLoading(true);

    try {
      const response = await axios.get(`${URL}coin/api/trades/${tokenAddress}`);
      const tradesData = response.data.trades || [];
      // console.log("Fetched trades from backend:", tradesData);
      // Sort trades by timestamp (newest first)
      const sortedTrades = tradesData.sort((a: Trade, b: Trade) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setFetchedTrades(sortedTrades);
    } catch (error) {
      // console.error("Error fetching trades:", error);
      setFetchedTrades(trades);
    } finally {
      setIsLoading(false);

    }
  };
  // Initial fetch
  useEffect(() => {
    fetchTrades();
  }, [tokenAddress]);


  useEffect(() => {
    if (!tokenAddress) return;
    const onNewTrade = (message: any) => {
      const tradeData = message.data;
      // console.log("new trade received via Ably", tradeData)
      // If user is on trades tab, update local state with the new trade
      if (activeTab === "trades") {
        setFetchedTrades((prevTrades) => {
          const updatedTrades = [...prevTrades, tradeData];
         
          return updatedTrades;
          
        });
      }
    };
    channel.subscribe("new_trade", onNewTrade);
    return () => {
      channel.unsubscribe("new_trade", onNewTrade);
    };
  }, [tokenAddress, activeTab]);

  useEffect(() => {

    fetchStoredMessages();
  }, [trades]);
  const handleTabClick = (tab: "thread" | "trades") => {
    setActiveTab(tab);
    if (tab === "trades") {
      setShouldFetch(true);
    }
  };

  const fetchStoredMessages = async () => {

    try {
      const response = await axios.get(`${URL}coin/getMessage/${tokenAddress}`);
      // Sort messages by timestamp (newest first)
      const sortedMessages = response.data.sort((a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Failed to fetch coin details:", error);
    }
  };
  useEffect(() => {
    channel.subscribe("coinAdded", (message: any) => {
      // console.log("New message received in real-time:", message.data);
      setMessages((prev) => [...prev, message.data.savedMessage]);
    })


    return () => {
      channel.unsubscribe();

    };
  }, []);

  const handlePostMessage = async () => {
    const payload = {
      msg,
      tokenAddress,
      walletAddress: publickey?.toBase58()
    };
    try {
      const response = await axios.post(`${URL}coin/message`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log("Message posted successfully:", response.data);

      setMsg("");
      setIsDialogOpen(false);
      fetchStoredMessages();
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong", {
        autoClose: 3000,
        closeButton: false,
        hideProgressBar: true,
        style: {
          backgroundColor: " rgba(17, 24, 39, 0.8)",
          color: "white",
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
          padding: "1rem",
          outline: "1px solid #FF0000",

        },
      });

      console.error("Failed to post message:", error);
    }
  };
  useEffect(() => {
    const fetchSimilarCoins = async () => {
      try {
        const response = await axios.get(
          `${URL}coin/getSimilarCoins/${tokenAddress}`
        );
        // console.log("response data", response.data);
        setCoins(response.data); // Make sure this matches your API response structure
      } catch (error) {
        console.error('Error fetching similar coins:', error);
      }
    };

    fetchSimilarCoins();
  }, []);
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });

  };
  const scrollCoins = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'right' ? 300 : -300,
        behavior: 'smooth',
      });
    }
  };
  // Fetch the reply count from localStorage when the component mounts
  useEffect(() => {
    const fetchReplyCount = async () => {
      try {
        const response = await axios.get(
          `${URL}coin/reply-count/${tokenAddress}`
        );
        // console.log("response data ", response.data);
        setReplyCount(response.data.replyCount);
      } catch (error) {
        console.error("Error fetching reply count:", error);
      }
    };

    fetchReplyCount();
    const channel = ably.channels.get(`reply-count-${tokenAddress}`);

    channel.subscribe("reply-count", (message) => {
      setReplyCount(message.data.replyCount);
      //   }
    });
    return () => {
      channel.unsubscribe();
    };
  }, []);
  // const getCoin = async () => {

  //   try {
  //     const response = await axios.get(`${URL}coin/coinDetail/${tokenAddress}`);
  //     console.log("response data Coin:", response.data);
  //     setCoinData(response.data);
  //   } catch (error) {
  //     console.error("Failed to fetch coin details:", error);
  //   }
  // };
  const getCoin = async () => {
  setLoading(true); // mark as loading
  try {
    const response = await axios.get(`${URL}coin/coinDetail/${tokenAddress}`);
    // console.log("response data Coin:", response.data);
    const channel = ably.channels.get(`reply-count-${tokenAddress}`);

    
     
    setCoinData(response.data);
 
  } catch (error) {
    console.error("Failed to fetch coin details:", error);
  } finally {
    setLoading(false); // mark loading complete
  }
};

  useEffect(() => {
    getCoin();
    return () => {
     
    };
  }, [tokenAddress]);
  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5"
    >
      <div className="flex items-center space-x-4 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pb-2">
        <TabButton
          active={activeTab === "thread"}
          onClick={() => handleTabClick("thread")}
          label="thread"
          color="green"
        />
        <TabButton
          active={activeTab === "trades"}
          onClick={() => handleTabClick("trades")}
          label="trades"
          color="purple"
        />
      </div>

      {activeTab === "thread" ? (
        <div className="space-y-4">
          <div className="space-y-4">
          <div className="relative flex">
  <div className="bg-gray-800/40 border border-purple-500/20 rounded-lg p-5 shadow-md">
    {/* Top row: Creator and Time */}
    <div className="flex justify-between items-center mb-3">
      {loading ? (
        <div className="w-full flex justify-between animate-pulse">
          <div className="h-4 bg-gray-500/30 rounded w-1/3"></div>
          <div className="h-4 bg-gray-500/30 rounded w-1/4 ml-2"></div>
        </div>
      ) : (
        <>
          <p className="text-sm text-purple-400">
            <span className="font-medium">{coinData?.creator?.name}</span>
          </p>
          <p className="text-sm text-gray-500 ml-2">
            {new Date(coinData?.time).toLocaleString()}
          </p>
        </>
      )}
    </div>

    {/* Main Content Row: Image and Info */}
    <div className="flex items-center space-x-5">
      {loading ? (
        <div className="animate-pulse flex items-center space-x-5">
          <div className="w-20 h-20 bg-gray-500/30 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-500/30 rounded w-48"></div>
            <div className="h-3 bg-gray-500/30 rounded w-64"></div>
          </div>
        </div>
      ) : (
        <>
          <img
            src={coinData?.imgUrl}
            className="w-20 h-20 object-cover"
            alt="coin"
          />
          <div>
            <h3 className="text-sm font-bold text-white -mt-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-indigo-500 transition-all">
              {coinData?.name}{" "}
              <span className="text-gray-400">({coinData?.ticker})</span>
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              <span className="text-sm">{coinData?.description}</span>
            </p>
          </div>
        </>
      )}
    </div>
  </div>
</div>

            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <ThreadMessage
                  key={index}
                  username={msg.sender?.name || "Anonymous"}
                  timestamp={msg.time ? new Date(msg.time).toLocaleString() : "N/A"}
                  message={msg.message || "No message available"}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No messages available
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-lg border border-dashed border-purple-500/40 text-purple-400 text-sm hover:bg-purple-500/10 transition-colors flex items-center justify-center space-x-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <span>post a reply</span>
            <Sparkles size={14} />
          </motion.button>
          <div className="mt-4 mx-4">
            <h3 className="text-lg text-purple-400 ml-9">similar coins</h3>

            <div className="relative mt-2 flex">

              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/70 p-2 rounded-full"
                onClick={() => scrollCoins('left')}
              >

                <ChevronLeft className="text-purple-400 w-5 h-5" />
              </button>

              {/* Scrollable Cards */}
              <div
                ref={scrollRef}
                className="flex space-x-5 overflow-x-auto px-10 py-2 scrollbar-thin scrollbar-thumb-purple-400/40"
              >
                {coins.slice(0, 10).map((coin, index) => (
                  <div
                    key={index}
                    className="min-w-[330px] bg-gray-800/40 border border-purple-500/20 rounded-lg p-4 py-4 shadow-md flex items-center space-x-4"
                  >
                    <img
                      src={coin.imgUrl}
                      alt={coin.name}
                      className="w-20 h-20 object-cover mb-2"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-indigo-500 transition-all">
                        {coin.name}{" "}
                        <span className="text-gray-400">({coin.ticker})</span>
                      </h3>
                      <p className="text-sm text-purple-400 ">
                        MarketCap: ${coin.marketCap.toFixed(2)}
                      </p>
                      <p className="text-white/80 text-sm">
                        replies: <span>{replyCount || 0}</span>
                      </p>
                      <p className="text-sm text-gray-400">created:
                        <span className="text-sm ml-1">{formatTime(coin.date)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/70 p-2 rounded-full"
                onClick={() => scrollCoins('right')}
              >
                <ChevronRight className="text-purple-400 w-5 h-5" />
              </button>
            </div>
          </div>
          <ToastContainer
            position="top-center"
          />
          {/* Dialog Box */}
          {isDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
              <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 p-6 rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/10 w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4">Post a Reply</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full border border-gray-700 rounded-lg p-2 bg-gray-800 text-white focus:outline-none focus:ring focus:ring-purple-500"
                    placeholder="Type your message..."
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="py-2 px-4 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePostMessage}
                      className="py-2 px-4 bg-purple-700 text-white rounded-lg hover:bg-purple-600"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        // </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="w-4 h-4 border-2 border-t-purple-400 border-gray-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-black/40 border-b border-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-2">Account</th>
                    <th scope="col" className="px-4 py-2">Type</th>
                    <th scope="col" className="px-4 py-2">Tokens</th>
                    <th scope="col" className="px-4 py-2">SOL</th>
                    <th scope="col" className="px-4 py-2">Transaction</th>
                    <th scope="col" className="px-4 py-2">Time Ago</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedTrades.length > 0 ? (
                    fetchedTrades.map((trade, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="px-4 py-2 font-mono">
                          <a
                            href={`https://explorer.solana.com/address/${trade.account}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {truncateAddress(trade.account)}
                          </a>
                        </td>
                        <td className={`px-4 py-2 ${trade.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                          {trade.type}
                        </td>
                        <td className="px-4 py-2">{formatTokenAmount(trade.tokenAmount)}</td>
                        <td className="px-4 py-2">{formatSolAmount(trade.solAmount)} SOL</td>
                        <td className="px-4 py-2">
                          <a
                            href={`https://explorer.solana.com/tx/${trade.txHex}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 font-mono truncate block max-w-[150px]"
                            title={trade.txHex}
                          >
                            {trade.txHex.slice(0, 8)}...
                          </a>
                        </td>
                        <td className="px-4 py-2">{formatTimeAgo(trade.timestamp)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-4">
                        No trades available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}
    </motion.div>
  );

  
};

export default ThreadSection;
