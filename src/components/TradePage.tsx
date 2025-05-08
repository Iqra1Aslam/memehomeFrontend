// // import React, { useState, useEffect, useMemo } from "react";
// // import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// // import Navbar from "../components/Navbar";
// // import NotificationBanner from "../components/trade-page/notification-banner";
// // import NavigationHeader from "../components/trade-page/navigation-header";
// // import ChartSection from "../components/trade-page/chart-section";
// // import ThreadSection from "../components/trade-page/thread-section";
// // import TokenTradingPanel from "../components/trade-page/TokenTradingPanel";
// // import { calculateAmountBuy } from "../utils/programFunction";

// // export interface TokenData {
// //   id: string;
// //   name: string;
// //   symbol: string;
// //   imgUrl: string;
// //   marketCap: string;
// //   price: string;
// //   change24h: string;
// //   volume24h: string;
// //   token?: string;
// //   bondingCurve?: string;
// //   description?: string;
// //   ticker?: string;
// //   progressValue?: number;
// // }

// // interface CandlestickData {
// //   time: number;
// //   open: number;
// //   high: number;
// //   low: number;
// //   close: number;
// // }

// // interface Trade {
// //   account: string;
// //   type: "buy" | "sell";
// //   tokenAmount: number;
// //   solAmount: number;
// //   txHex: string;
// //   tokenAddress: string;
// //   timestamp: string;
// // }

// // interface TradeNotification {
// //   tokenName: string;
// //   tradeType: "bought" | "sold";
// //   marketCap: string;
// //   amount: string;
// //   trades?: Trade[]; // Add trades to the interface
// // }

// // interface TradePageProps {
// //   onBack: () => void;
// //   tokenData?: TokenData;
// // }

// // const defaultTokenData: TokenData = {
// //   id: "1",
// //   name: "PEPE SOL",
// //   symbol: "PEPE",
// //   imgUrl:
// //     "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2080",
// //   marketCap: "$8.9k",
// //   price: "0.00000004109",
// //   change24h: "+288.67%",
// //   volume24h: "$2.3k",
// //   token: "",
// //   bondingCurve: "3u3PxPiAdoXDrZ9ZVXS3j4CitDBsgMrK7bYjAA6YbmsX",
// //   description: "The original Pepe token on Solana",
// //   ticker: "PEPE",
// //   progressValue: 78,
// // };

// // const TradePage: React.FC<TradePageProps> = ({
// //   onBack,
// //   tokenData = defaultTokenData,
// // }) => {
// //   const [amount, setAmount] = useState<string>("0.00");
// //   const [activeTab, setActiveTab] = useState<"thread" | "trades">("thread");
// //   const [isBuyActive, setIsBuyActive] = useState<boolean>(true);
// //   const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
// //   const [chartData, setChartData] = useState<CandlestickData[]>([]);
// //   const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
// //   const [tradeNotification, setTradeNotification] =
// //     useState<TradeNotification | null>(null);
// //   const [trades, setTrades] = useState<Trade[]>([]); // New state for trades

// //   const wallet = useWallet();
// //   const { connection } = useConnection();
// //   const { publicKey } = wallet;

// //   useEffect(() => {
// //     setIsWalletConnected(!!publicKey);
// //   }, [publicKey]);

// //   const stableTokenData = useMemo(() => tokenData, [tokenData]);

// //   const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const value = e.target.value;
// //     setAmount(value);
// //     if (!isNaN(Number(value)) && stableTokenData.bondingCurve) {
// //       try {
// //         const amountOut = await calculateAmountBuy(
// //           Number(value),
// //           stableTokenData.bondingCurve
// //         );
// //         setCalculatedAmount(Math.round(amountOut));
// //       } catch (error) {
// //         console.error("Error calculating amount:", error);
// //         setCalculatedAmount(0);
// //       }
// //     } else {
// //       setCalculatedAmount(0);
// //     }
// //   };

// //   const handlePresetAmount = (value: string) => {
// //     setAmount(value);
// //     if (!isNaN(Number(value)) && stableTokenData.bondingCurve) {
// //       calculateAmountBuy(Number(value), stableTokenData.bondingCurve)
// //         .then((amountOut) => setCalculatedAmount(Math.round(amountOut)))
// //         .catch((error) => {
// //           console.error("Error calculating preset amount:", error);
// //           setCalculatedAmount(0);
// //         });
// //     }
// //   };

// //   const handleChartDataUpdate = (data: CandlestickData[]) => {
// //     setChartData(data);
// //   };

// //   const handleTradeSuccess = (tradeDetails: TradeNotification) => {
// //     console.log("Setting trade notification and trades:", tradeDetails);
// //     setTradeNotification({
// //       tokenName: tradeDetails.tokenName,
// //       tradeType: tradeDetails.tradeType,
// //       marketCap: tradeDetails.marketCap,
// //       amount: tradeDetails.amount,
// //     });
// //     if (tradeDetails.trades) {
// //       setTrades(tradeDetails.trades); // Update trades state
// //     }
// //   };

// //   useEffect(() => {
// //     console.log("TradePage rendered", {
// //       activeTab,
// //       tokenData: stableTokenData,
// //       trades,
// //     });
// //   });

// //   return (
// //     <div className="min-h-screen bg-black text-white overflow-x-hidden">
// //       <Navbar onLaunchClick={() => {}} />
// //       <div className="pt-24 px-4 md:px-6 max-w-7xl mx-auto">
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
// //           <NotificationBanner
// //             tokenName={
// //               tradeNotification
// //                 ? tradeNotification.tokenName
// //                 : stableTokenData.name
// //             }
// //             marketCap={
// //               tradeNotification
// //                 ? tradeNotification.marketCap
// //                 : stableTokenData.marketCap
// //             }
// //             tradeType={tradeNotification?.tradeType}
// //             amount={tradeNotification?.amount}
// //           />
// //           <NotificationBanner
// //             tokenName={stableTokenData.name}
// //             marketCap={stableTokenData.marketCap}
// //             tradeType={undefined}
// //             amount={undefined}
// //           />
// //         </div>
// //         <NavigationHeader
// //           onBack={onBack}
// //           tokenName={stableTokenData.name}
// //           tokenSymbol={stableTokenData.symbol}
// //           marketCap={stableTokenData.marketCap}
// //         />
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //           <div className="lg:col-span-2 space-y-6">
// //             <ChartSection
// //               isWalletConnected={isWalletConnected}
// //               tokenData={stableTokenData}
// //               chartData={chartData}
// //             />
// //             <ThreadSection
// //               activeTab={activeTab}
// //               setActiveTab={setActiveTab}
// //               tokenName={stableTokenData.name}
// //               tokenAddress={stableTokenData.token}
// //               trades={trades} // Pass trades to ThreadSection
// //             />
// //           </div>
// //           <div className="space-y-6">
// //             <TokenTradingPanel
// //               tokenData={stableTokenData}
// //               publicKey={publicKey}
// //               connection={connection}
// //               wallet={wallet}
// //               id={stableTokenData.id}
// //               onChartDataUpdate={handleChartDataUpdate}
// //               onTradeSuccess={handleTradeSuccess}
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default TradePage;


// import React, { useState, useEffect, useMemo } from "react";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import Navbar from "../components/Navbar";
// import NotificationBanner from "../components/trade-page/notification-banner";
// import NavigationHeader from "../components/trade-page/navigation-header";
// import ChartSection from "../components/trade-page/chart-section";
// import ThreadSection from "../components/trade-page/thread-section";
// import TokenTradingPanel from "../components/trade-page/TokenTradingPanel";
// import { calculateAmountBuy } from "../utils/programFunction";

// export interface TokenData {
//   id: string;
//   name: string;
//   symbol: string;
//   imgUrl: string;
//   marketCap: string;
//   price: string;
//   change24h: string;
//   volume24h: string;
//   token?: string;
//   bondingCurve?: string;
//   description?: string;
//   ticker?: string;
//   progressValue?: number;
// }

// interface CandlestickData {
//   time: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface Trade {
//   account: string;
//   type: "buy" | "sell";
//   tokenAmount: number;
//   solAmount: number;
//   txHex: string;
//   tokenAddress: string;
//   timestamp: string;
// }

// interface TradeNotification {
//   tokenName: string;
//   tradeType: "bought" | "sold";
//   marketCap: string;
//   amount: string;
//   trades?: Trade[];
// }

// interface TradePageProps {
//   onBack: () => void;
//   tokenData?: TokenData | null;
// }

// const defaultTokenData: TokenData = {
//   id: "1",
//   name: "PEPE SOL",
//   symbol: "PEPE",
//   imgUrl:
//     "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2080",
//   marketCap: "$8.9k",
//   price: "0.00000004109",
//   change24h: "+288.67%",
//   volume24h: "$2.3k",
//   token: "",
//   bondingCurve: "3u3PxPiAdoXDrZ9ZVXS3j4CitDBsgMrK7bYjAA6YbmsX",
//   description: "The original Pepe token on Solana",
//   ticker: "PEPE",
//   progressValue: 78,
// };

// // Local storage key for tokenData
// const TOKEN_DATA_STORAGE_KEY = "tradePageTokenData";

// const TradePage: React.FC<TradePageProps> = ({
//   onBack,
//   tokenData: providedTokenData,
// }) => {
//   // Helper function to get tokenData from local storage
//   const getStoredTokenData = (): TokenData => {
//     const storedData = localStorage.getItem(TOKEN_DATA_STORAGE_KEY);
//     return storedData ? JSON.parse(storedData) : defaultTokenData;
//   };

//   // Determine initial tokenData: props > local storage > default
//   const initialTokenData = providedTokenData ?? getStoredTokenData();
//   const [amount, setAmount] = useState<string>("0.00");
//   const [activeTab, setActiveTab] = useState<"thread" | "trades">("thread");
//   const [isBuyActive, setIsBuyActive] = useState<boolean>(true);
//   const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
//   const [chartData, setChartData] = useState<CandlestickData[]>([]);
//   const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
//   const [tradeNotification, setTradeNotification] =
//     useState<TradeNotification | null>(null);
//   const [trades, setTrades] = useState<Trade[]>([]);

//   const wallet = useWallet();
//   const { connection } = useConnection();
//   const { publicKey } = wallet;

//   // Memoize tokenData to prevent unnecessary re-renders
//   const stableTokenData = useMemo(() => initialTokenData, [initialTokenData]);

//   // Store tokenData in local storage when it’s provided via props
//   useEffect(() => {
//     if (providedTokenData) {
//       localStorage.setItem(
//         TOKEN_DATA_STORAGE_KEY,
//         JSON.stringify(providedTokenData)
//       );
//       console.log("Stored tokenData in local storage:", providedTokenData);
//     }
//   }, [providedTokenData]);

//   // Check wallet connection status
//   useEffect(() => {
//     setIsWalletConnected(!!publicKey);
//   }, [publicKey]);

//   const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setAmount(value);
//     if (!isNaN(Number(value)) && stableTokenData.bondingCurve) {
//       try {
//         const amountOut = await calculateAmountBuy(
//           Number(value),
//           stableTokenData.bondingCurve
//         );
//         setCalculatedAmount(Math.round(amountOut));
//       } catch (error) {
//         console.error("Error calculating amount:", error);
//         setCalculatedAmount(0);
//       }
//     } else {
//       setCalculatedAmount(0);
//     }
//   };

//   const handlePresetAmount = (value: string) => {
//     setAmount(value);
//     if (!isNaN(Number(value)) && stableTokenData.bondingCurve) {
//       calculateAmountBuy(Number(value), stableTokenData.bondingCurve)
//         .then((amountOut) => setCalculatedAmount(Math.round(amountOut)))
//         .catch((error) => {
//           console.error("Error calculating preset amount:", error);
//           setCalculatedAmount(0);
//         });
//     }
//   };

//   const handleChartDataUpdate = (data: CandlestickData[]) => {
//     setChartData(data);
//   };

//   const handleTradeSuccess = (tradeDetails: TradeNotification) => {
//     console.log("Setting trade notification and trades:", tradeDetails);
//     setTradeNotification({
//       tokenName: tradeDetails.tokenName,
//       tradeType: tradeDetails.tradeType,
//       marketCap: tradeDetails.marketCap,
//       amount: tradeDetails.amount,
//     });
//     if (tradeDetails.trades) {
//       setTrades(tradeDetails.trades);
//     }
//   };

//   useEffect(() => {
//     console.log("TradePage rendered", {
//       activeTab,
//       tokenData: stableTokenData,
//       trades,
//     });
//   });

//   return (
//     <div className="min-h-screen bg-black text-white overflow-x-hidden">
//       <Navbar onLaunchClick={() => {}} />
//       <div className="pt-24 px-4 md:px-6 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//           <NotificationBanner
//             tokenName={
//               tradeNotification?.tokenName ?? stableTokenData.name
//             }
//             marketCap={
//               tradeNotification?.marketCap ?? stableTokenData.marketCap
//             }
//             tradeType={tradeNotification?.tradeType}
//             amount={tradeNotification?.amount}
//           />
//           <NotificationBanner
//             tokenName={stableTokenData.name}
//             marketCap={stableTokenData.marketCap}
//             tradeType={undefined}
//             amount={undefined}
//           />
//         </div>
//         <NavigationHeader
//           onBack={onBack}
//           tokenName={stableTokenData.name}
//           tokenSymbol={stableTokenData.symbol}
//           marketCap={stableTokenData.marketCap}
//         />
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-6">
//             <ChartSection
//               isWalletConnected={isWalletConnected}
//               tokenData={stableTokenData}
//               chartData={chartData}
//             />
//             <ThreadSection
//               activeTab={activeTab}
//               setActiveTab={setActiveTab}
//               tokenName={stableTokenData.name}
//               tokenAddress={stableTokenData.token}
//               trades={trades}
//             />
//           </div>
//           <div className="space-y-6">
//             <TokenTradingPanel
//               tokenData={stableTokenData}
//               publicKey={publicKey}
//               connection={connection}
//               wallet={wallet}
//               id={stableTokenData.id}
//               onChartDataUpdate={handleChartDataUpdate}
//               onTradeSuccess={handleTradeSuccess}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TradePage;














import React, { useState, useEffect, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import NotificationBanner from "../components/trade-page/notification-banner";
import NavigationHeader from "../components/trade-page/navigation-header";
import ChartSection from "../components/trade-page/chart-section";
import ThreadSection from "../components/trade-page/thread-section";
import TokenTradingPanel from "../components/trade-page/TokenTradingPanel";
import { calculateAmountBuy } from "../utils/programFunction";

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  imgUrl: string;
  marketCap: string;
  price: string;
  change24h: string;
  volume24h: string;
  token?: string;
  bondingCurve?: string;
  description?: string;
  ticker?: string;
  progressValue?: number;
}

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Trade {
  account: string;
  type: "buy" | "sell";
  tokenAmount: number;
  solAmount: number;
  txHex: string;
  tokenAddress: string;
  timestamp: string;
}

interface TradeNotification {
  tokenName: string;
  tradeType: "bought" | "sold";
  marketCap: string;
  amount: string;
  trades?: Trade[];
}

// interface TradePageProps {
//   onBack: () => void;
//   tokenData?: TokenData | null;
// }
interface TradePageProps {
  onBack: () => void;
  tokenData?: TokenData | null;
  price: number | null; // Add price prop
}

const defaultTokenData: TokenData = {
  id: "1",
  name: "PEPE SOL",
  symbol: "PEPE",
  imgUrl:
    "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2080",
  marketCap: "$8.9k",
  price: "0.00000004109",
  change24h: "+288.67%",
  volume24h: "$2.3k",
  token: "",
  bondingCurve: "3u3PxPiAdoXDrZ9ZVXS3j4CitDBsgMrK7bYjAA6YbmsX",
  description: "The original Pepe token on Solana",
  ticker: "PEPE",
  progressValue: 78,
};

// Local storage key for tokenData
const TOKEN_DATA_STORAGE_KEY = "tradePageTokenData";

const TradePage: React.FC<TradePageProps> = ({
  onBack,
  tokenData: providedTokenData,
  price,
}) => {
  // Helper function to get tokenData from local storage
  const getStoredTokenData = (): TokenData => {
    const storedData = localStorage.getItem(TOKEN_DATA_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : defaultTokenData;
  };

  // Determine initial tokenData: props > local storage > default
  const initialTokenData = providedTokenData ?? getStoredTokenData();
  const [amount, setAmount] = useState<string>("0.00");
  const [activeTab, setActiveTab] = useState<"thread" | "trades">("thread");
  const [isBuyActive, setIsBuyActive] = useState<boolean>(true);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [tradeNotification, setTradeNotification] =
    useState<TradeNotification | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  const wallet = useWallet();
  const { connection } = useConnection();
  const { publicKey } = wallet;

  // Memoize tokenData to prevent unnecessary re-renders
  const stableTokenData = useMemo(() => initialTokenData, [initialTokenData]);

  // Store tokenData in local storage when it’s provided via props
  useEffect(() => {
    if (providedTokenData) {
      localStorage.setItem(
        TOKEN_DATA_STORAGE_KEY,
        JSON.stringify(providedTokenData)
      );
      // console.log("Stored tokenData in local storage:", providedTokenData);
    }
  }, [providedTokenData]);

  // Check wallet connection status
  useEffect(() => {
    setIsWalletConnected(!!publicKey);
  }, [publicKey]);

  const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (!isNaN(Number(value)) && stableTokenData.bondingCurve) {
      try {
        const amountOut = await calculateAmountBuy(
          Number(value),
          stableTokenData.bondingCurve
        );
        setCalculatedAmount(Math.round(amountOut));
      } catch (error) {
        console.error("Error calculating amount:", error);
        setCalculatedAmount(0);
      }
    } else {
      setCalculatedAmount(0);
    }
  };

  const handlePresetAmount = (value: string) => {
    setAmount(value);
    if (!isNaN(Number(value)) && stableTokenData.bondingCurve) {
      calculateAmountBuy(Number(value), stableTokenData.bondingCurve)
        .then((amountOut) => setCalculatedAmount(Math.round(amountOut)))
        .catch((error) => {
          console.error("Error calculating preset amount:", error);
          setCalculatedAmount(0);
        });
    }
  };

  const handleChartDataUpdate = (data: CandlestickData[]) => {
    setChartData(data);
  };

  const handleTradeSuccess = (tradeDetails: TradeNotification) => {
    console.log("Setting trade notification and trades:", tradeDetails);
    setTradeNotification({
      tokenName: tradeDetails.tokenName,
      tradeType: tradeDetails.tradeType,
      marketCap: tradeDetails.marketCap,
      amount: tradeDetails.amount,
    });
    if (tradeDetails.trades) {
      setTrades(tradeDetails.trades);
    }
  };

  // useEffect(() => {
  //   console.log("TradePage rendered", {
  //     activeTab,
  //     tokenData: stableTokenData.token,
  //     trades,
  //   });
  // });

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar is now provided by App.tsx */}
      <div className="pt-20 px-4 md:px-6 max-w-7xl mx-auto">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <NotificationBanner
            tokenName={tradeNotification?.tokenName ?? stableTokenData.name}
            marketCap={
              tradeNotification?.marketCap ?? stableTokenData.marketCap
            }
            tradeType={tradeNotification?.tradeType}
            amount={tradeNotification?.amount}
          />
          <NotificationBanner
            tokenName={stableTokenData.name}
            marketCap={stableTokenData.marketCap}
            tradeType={undefined}
            amount={undefined}
          />
        </div> */}
        {/* <NavigationHeader
          onBack={onBack}
          tokenName={stableTokenData.name}
          tokenSymbol={stableTokenData.symbol}
          marketCap={stableTokenData.marketCap}

        /> */}
         <NavigationHeader
          onBack={onBack}
          tokenName={stableTokenData.name}
          tokenSymbol={stableTokenData.symbol}
          marketCap={stableTokenData.marketCap}
          price={price}
          token={stableTokenData.token}
         
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChartSection
              isWalletConnected={isWalletConnected}
              tokenData={stableTokenData}
              chartData={chartData}
            />
            <ThreadSection
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tokenName={stableTokenData.name}
              tokenAddress={stableTokenData.token}
              trades={trades}
            />
          </div>
          <div className="space-y-6">
            <TokenTradingPanel
              tokenData={stableTokenData}
              publicKey={publicKey}
              connection={connection}
              wallet={wallet}
              id={stableTokenData.id}
              onChartDataUpdate={handleChartDataUpdate}
              onTradeSuccess={handleTradeSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage;