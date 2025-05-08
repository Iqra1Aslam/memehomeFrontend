// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Navbar from "./components/Navbar";
// import CreateToken from "./components/CreateToken";
// import TradePage from "./components/TradePage";
// // import { getSolPrice } from "./components/SolToUsd";
// import CoinCard from "./components/listcoin/CoinCard";
// // import Ably from "ably";

// import { channel } from "./utils/ablyClient";
// import "./index.css";
// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import Home from "./components/Home";

// const URL = import.meta.env.VITE_API_URL;

// interface Coin {
//   _id: string;
//   name: string;
//   ticker: string;
//   imgUrl: string;
//   marketCap: number;
//   creator: {
//     _id: string;
//     name: string;
//     wallet: string;
//     avatar: string;
//     __v: number;
//   };
//   description: string;
//   holders: number;
//   volume24h: string;
//   price: string;
//   change24h: string;
//   date: string;
// }

// function App() {
//   const [selectedToken, setSelectedToken] = useState<Coin | null>(null);
//   const [coins, setCoins] = useState<Coin[]>([]);
//   const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [price, setPrice] = useState<number | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [kothCoins, setKothCoins] = useState<Coin[]>([]);
//   const navigate = useNavigate();
//   const location = useLocation();
//   // const ably = new Ably.Realtime("qR94EA.6wk1Hw:8rEGkjC032riq48eMyuO0sHv4K_j04YjhZGpoYF1hCU");
//   // const channel = ably.channels.get("coins");

//   useEffect(() => {
//     const fetchCoins = async () => {
//       try {
//         const response = await fetch(`${URL}coin/getAllCoins`);
//         if (!response.ok) throw new Error("Network response was not ok");
//         const data = await response.json();

//         setCoins(data);
//         setFilteredCoins(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchCrownTokens = async () => {
//       try {
//         // const getCrownCoins = await fetch(`${URL}coin/getkothCoins`);
//         const getCrownCoins = await fetch(`${URL}coin/getkothCoins`);
//         if (!getCrownCoins.ok) throw new Error("Response was not ok");
//         const data = await getCrownCoins.json();
//         console.log("koth coins: ", data);
//         if (Array.isArray(data.data)) setKothCoins(data.data);
//       } catch (error) {
//         console.error("error getting koth coins: ", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCoins();
//     fetchCrownTokens();
//     // Initial fetches
//     fetchCoins();
//     fetchCrownTokens();

//     // socket listener: coinAdded
//     const handleNewCoin = (message: any) => {
//       const newCoin = message.data;
//       console.log("New coin received via Ably:", newCoin);
//       setCoins((prevCoins) => [...prevCoins, newCoin]);
//       setFilteredCoins((prevCoins) => [...prevCoins, newCoin]);
//     };

//     channel.subscribe("coinAdded", handleNewCoin);

//     // socket listener: kothGet (only to re-fetch tokens)
//     const handleKothGet = (message: any) => {
//       console.log("kothGet event received:", message);
//       fetchCrownTokens(); // just re-fetch tokens
//     };

//     channel.subscribe("kothGet", handleKothGet);
//     // Cleanup on unmount
//     return () => {
//       channel.unsubscribe("coinAdded", handleNewCoin);
//       channel.unsubscribe("kothGet", handleKothGet);
//     };
//   }, []);

//   useEffect(() => {
//     async function fetchPrice() {
//       const solPrice = await fetch(`${URL}coin/sol-price`);
//       const setSolPrice = await solPrice.json();

//       console.log("sol price: ", setSolPrice.USD);
//       localStorage.setItem("sol-price", setSolPrice.USD);

//       setPrice(setSolPrice.USD);
//     }

//     fetchPrice();
//     const interval = setInterval(fetchPrice, 50000);
//     return () => clearInterval(interval);
//   }, []);

//   const highMarketCapCoins = kothCoins;

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     const filtered = coins.filter(
//       (coin) =>
//         coin.name.toLowerCase().includes(query.toLowerCase()) ||
//         coin.ticker.toLowerCase().includes(query.toLowerCase())
//     );
//     const regularFilteredCoins = filtered.filter(
//       (coin) => coin.marketCap * (price ?? 164.91) <= 4000
//     );
//     setFilteredCoins(regularFilteredCoins);
//   };

//   const topCoin =
//     coins.length > 0
//       ? coins.reduce((prev, current) =>
//           prev.marketCap > current.marketCap ? prev : current
//         )
//       : null;

//   const handleTradeClick = (token: Coin) => {
//     setSelectedToken(token);
//     navigate("/token-detail", {
//       state: {
//         tokenData: {
//           id: token._id,
//           name: token.name,
//           symbol: token.ticker,
//           imgUrl: token.imgUrl,
//           marketCap: `${(token.marketCap * (price ?? 164.91)).toFixed(2)}`,
//           price: token.price,
//           change24h: token.change24h,
//           volume24h: token.volume24h,
//           description: token.description,
//           ticker: token.ticker,
//         },
//       },
//     });
//   };

//   const handleLaunchClick = () => {
//     navigate("/create-token");
//   };

//   // Preloader component with "memehome is getting ready......." text and opacity animation
//   const Preloader = () => (
//     <motion.div
//       initial={{ opacity: 1 }}
//       animate={{ opacity: loading ? 1 : 0 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         backgroundColor: "#000",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         zIndex: 9999,
//         pointerEvents: loading ? "auto" : "none",
//       }}
//       onAnimationComplete={() =>
//         !loading && (document.body.style.overflow = "auto")
//       }
//     >
//       <div className="text-center">
//         <h1
//           className="text-4xl font-bold animate-pulse-opacity"
//           style={{
//             background: "linear-gradient(to right, #a855f7, #3b82f6)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//           }}
//         >
//           memehome is getting ready.......
//         </h1>
//       </div>
//     </motion.div>
//   );

//   // Only show preloader on homepage ("/") and while loading
//   const showPreloader = location.pathname === "/" && loading;

//   if (error)
//     return <div className="text-red-500 text-center">Error: {error}</div>;

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Show preloader only on homepage while loading */}
//       {showPreloader && <Preloader />}

//       {/* Main content */}
//       <AnimatePresence>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 topCoin={topCoin}
//                 price={price}
//                 handleSearch={handleSearch}
//                 highMarketCapCoins={highMarketCapCoins}
//                 CoinCard={CoinCard}
//                 filteredCoins={filteredCoins}
//                 handleTradeClick={handleTradeClick}
//                 onLaunchClick={handleLaunchClick}
//               />
//             }
//           />
//           <Route
//             path="/create-token"
//             element={<CreateToken onClose={() => navigate("/")} />}
//           />
//           <Route
//             path="/token-detail"
//             element={
//               <>
//                 <Navbar onLaunchClick={handleLaunchClick} />
//                 <TradePage
//                   onBack={() => navigate("/")}
//                   tokenData={selectedToken}
//                   price={price} // Pass the price prop here
//                 />
//               </>
//             }
//           />
//           {/* Removed the /how-it-works route */}
//         </Routes>
//       </AnimatePresence>
//     </div>
//   );
// }

// export default App;

// import { Analytics } from '@vercel/analytics/react';
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { debounce } from "lodash";
// import Navbar from "./components/Navbar";
// import CreateToken from "./components/CreateToken";
// import TradePage from "./components/TradePage";
// import CoinCard from "./components/listcoin/CoinCard";
// import { channel } from "./utils/ablyClient";
// import "./index.css";
// import Home from "./components/Home";

// const URL = import.meta.env.VITE_API_URL;

// interface Coin {
//   _id: string;
//   name: string;
//   ticker: string;
//   imgUrl: string;
//   marketCap: number;
//   creator: {
//     _id: string;
//     name: string;
//     wallet: string;
//     avatar: string;
//     __v: number;
//   };
//   description: string;
//   holders: number;
//   volume24h: string;
//   price: string;
//   change24h: string;
//   date: string;
// }

// function App() {
//   const [selectedToken, setSelectedToken] = useState<Coin | null>(null);
//   const [coins, setCoins] = useState<Coin[]>([]);
//   const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [price, setPrice] = useState<number | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [kothCoins, setKothCoins] = useState<Coin[]>([]);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const fetchCoins = async () => {
//       try {
//         const cachedCoins = localStorage.getItem("coins");
//         if (cachedCoins) {
//           const data = JSON.parse(cachedCoins);
//           setCoins(data);
//           setFilteredCoins(data);
//           setLoading(false);
//           return;
//         }
//         const response = await fetch(`${URL}coin/getAllCoins`);
//         if (!response.ok) throw new Error("Network response was not ok");
//         const data = await response.json();
//         setCoins(data);
//         setFilteredCoins(data);
//         localStorage.setItem("coins", JSON.stringify(data));
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
// console.log(setCoins)

//     const fetchCrownTokens = async () => {
//       try {
//         const cachedKothCoins = localStorage.getItem("kothCoins");
//         if (cachedKothCoins) {
//           const data = JSON.parse(cachedKothCoins);
//           if (Array.isArray(data)) setKothCoins(data);
//           return;
//         }
//         const getCrownCoins = await fetch(`${URL}coin/getkothCoins`);
//         if (!getCrownCoins.ok) throw new Error("Response was not ok");
//         const data = await getCrownCoins.json();
//         if (Array.isArray(data.data)) {
//           setKothCoins(data.data);
//           localStorage.setItem("kothCoins", JSON.stringify(data.data));
//         }
//       } catch (error) {
//         console.error("error getting koth coins: ", error);
//       }
//     };

//     const debouncedFetchCrownTokens = debounce(fetchCrownTokens, 1000);

//     fetchCoins();
//     fetchCrownTokens();

//     const handleNewCoin = (message: any) => {
//       const newCoin = message.data;
//       console.log("New coin received via Ably:", newCoin);
//       setCoins((prevCoins) => {
//         const updatedCoins = [...prevCoins, newCoin];
//         localStorage.setItem("coins", JSON.stringify(updatedCoins));
//         return updatedCoins;
//       });
//       setFilteredCoins((prevCoins) => [...prevCoins, newCoin]);
//     };

//     const handleKothGet = (message: any) => {
//       console.log("kothGet event received:", new Date().toISOString(), message);
//       debouncedFetchCrownTokens();
//     };

//     channel.subscribe("coinAdded", handleNewCoin);
//     channel.subscribe("kothGet", handleKothGet);

//     return () => {
//       channel.unsubscribe("coinAdded", handleNewCoin);
//       channel.unsubscribe("kothGet", handleKothGet);
//       debouncedFetchCrownTokens.cancel();
//     };
//   }, []);

//   useEffect(() => {
//     async function fetchPrice() {
//       try {
//         const solPrice = await fetch(`${URL}coin/sol-price`);
//         const setSolPrice = await solPrice.json();
//         console.log("sol price: ", setSolPrice.USD);
//         localStorage.setItem("sol-price", setSolPrice.USD);
//         setPrice(setSolPrice.USD);
//       } catch (error) {
//         console.error("Error fetching SOL price:", error);
//       }
//     }

//     fetchPrice();
//     const interval = setInterval(fetchPrice, 120000); // Every 2 minutes
//     return () => clearInterval(interval);
//   }, []);

//   const highMarketCapCoins = kothCoins;

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     const filtered = coins.filter(
//       (coin) =>
//         coin.name.toLowerCase().includes(query.toLowerCase()) ||
//         coin.ticker.toLowerCase().includes(query.toLowerCase())
//     );
//     const regularFilteredCoins = filtered.filter(
//       (coin) => coin.marketCap * (price ?? 164.91) <= 4000
//     );
//     setFilteredCoins(regularFilteredCoins);
//   };

//   const topCoin =
//     coins.length > 0
//       ? coins.reduce((prev, current) =>
//           prev.marketCap > current.marketCap ? prev : current
//         )
//       : null;

//   const handleTradeClick = (token: Coin) => {
//     setSelectedToken(token);
//     navigate("/token-detail", {
//       state: {
//         tokenData: {
//           id: token._id,
//           name: token.name,
//           symbol: token.ticker,
//           imgUrl: token.imgUrl,
//           marketCap: `${(token.marketCap * (price ?? 164.91)).toFixed(2)}`,
//           price: token.price,
//           change24h: token.change24h,
//           volume24h: token.volume24h,
//           description: token.description,
//           ticker: token.ticker,
//         },
//       },
//     });
//   };

//   const handleLaunchClick = () => {
//     navigate("/create-token");
//   };

//   const Preloader = () => (
//     <motion.div
//       initial={{ opacity: 1 }}
//       animate={{ opacity: loading ? 1 : 0 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         backgroundColor: "#000",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         zIndex: 9999,
//         pointerEvents: loading ? "auto" : "none",
//       }}
//       onAnimationComplete={() =>
//         !loading && (document.body.style.overflow = "auto")
//       }
//     >
//       <div className="text-center">
//         <h1
//           className="text-4xl font-bold animate-pulse-opacity"
//           style={{
//             background: "linear-gradient(to right, #a855f7, #3b82f6)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//           }}
//         >
//           memehome is getting ready.......
//         </h1>
//       </div>
//     </motion.div>
//   );

//   const showPreloader = location.pathname === "/" && loading;

//   if (error)
//     return <div className="text-red-500 text-center">Error: {error}</div>;

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {showPreloader && <Preloader />}
//       <AnimatePresence>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 topCoin={topCoin}
//                 price={price}
//                 handleSearch={handleSearch}
//                 highMarketCapCoins={highMarketCapCoins}
//                 CoinCard={CoinCard}
//                 filteredCoins={filteredCoins}
//                 handleTradeClick={handleTradeClick}
//                 onLaunchClick={handleLaunchClick}
//               />
//             }
//           />
//           <Route
//             path="/create-token"
//             element={<CreateToken onClose={() => navigate("/")} />}
//           />
//           <Route
//             path="/token-detail"
//             element={
//               <>
//                 <Navbar onLaunchClick={handleLaunchClick} />
//                 <TradePage
//                   onBack={() => navigate("/")}
//                   tokenData={selectedToken}
//                   price={price}
//                 />
//               </>
//             }
//           />
//         </Routes>
//       </AnimatePresence>
//         <Analytics />
//     </div>
    
//   );
// }

// export default App;



import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { debounce } from "lodash";
import Navbar from "./components/Navbar";
import CreateToken from "./components/CreateToken";
import TradePage from "./components/TradePage";
import CoinCard from "./components/listcoin/CoinCard";
import { channel } from "./utils/ablyClient";
import "./index.css";
import Home from "./components/Home";

const URL = import.meta.env.VITE_API_URL;

interface Coin {
  _id: string;
  name: string;
  ticker: string;
  imgUrl: string;
  marketCap: number;
  creator: {
    _id: string;
    name: string;
    wallet: string;
    avatar: string;
    __v: number;
  };
  description: string;
  holders: number;
  volume24h: string;
  price: string;
  token: string;
  change24h: string;
  date: string;
}

function App() {
  const [selectedToken, setSelectedToken] = useState<Coin | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [kothCoins, setKothCoins] = useState<Coin[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        // Always try to fetch from the API first
        const response = await fetch(`${URL}coin/getAllCoins`);
        // console.log("response: ", response);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        // console.log("data: ", data);
        setCoins(data);
        setFilteredCoins(data);
        localStorage.setItem("coins", JSON.stringify(data)); // Cache the data
      } catch (error: any) {
        console.error("Error fetching coins from API:", error);
        // Fallback to localStorage if API fails
        const cachedCoins = localStorage.getItem("coins");
        if (cachedCoins) {
          const data = JSON.parse(cachedCoins);
          setCoins(data);
          setFilteredCoins(data);
        } else {
          setError(error.message); // No cache available, set error
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchCrownTokens = async () => {
      try {
        // Always try to fetch from the API first
        const getCrownCoins = await fetch(`${URL}coin/getkothCoins`);
        
        if (!getCrownCoins.ok) throw new Error("Response was not ok");
        const data = await getCrownCoins.json();
        if (Array.isArray(data.data)) {
          setKothCoins(data.data);
          localStorage.setItem("kothCoins", JSON.stringify(data.data)); // Cache the data
        }
      } catch (error) {
        console.error("Error fetching koth coins from API:", error);
        // Fallback to localStorage if API fails
        const cachedKothCoins = localStorage.getItem("kothCoins");
        if (cachedKothCoins) {
          const data = JSON.parse(cachedKothCoins);
          if (Array.isArray(data)) setKothCoins(data);
        }
      }
    };

    const debouncedFetchCrownTokens = debounce(fetchCrownTokens, 1000);

    fetchCoins();
    fetchCrownTokens();

    const handleNewCoin = (message: any) => {
      const newCoin = message.data;
      // console.log("New coin received via Ably:", newCoin);
      setCoins((prevCoins) => {
        const updatedCoins = [...prevCoins, newCoin];
        localStorage.setItem("coins", JSON.stringify(updatedCoins));
        return updatedCoins;
      });
      setFilteredCoins((prevCoins) => [...prevCoins, newCoin]);
    };

    const handleKothGet = (message: any) => {
      // console.log("kothGet event received:", new Date().toISOString(), message);
      debouncedFetchCrownTokens();
    };

    channel.subscribe("coinAdded", handleNewCoin);
    channel.subscribe("kothGet", handleKothGet);

    return () => {
      channel.unsubscribe("coinAdded", handleNewCoin);
      channel.unsubscribe("kothGet", handleKothGet);
      debouncedFetchCrownTokens.cancel();
    };
  }, []);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const solPrice = await fetch(`${URL}coin/sol-price`);
        const setSolPrice = await solPrice.json();
        // console.log("sol price: ", setSolPrice.USD);
        localStorage.setItem("sol-price", setSolPrice.USD);
        setPrice(setSolPrice.USD);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 120000); // Every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const highMarketCapCoins = kothCoins;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.ticker.toLowerCase().includes(query.toLowerCase())
    );
    const regularFilteredCoins = filtered.filter(
      (coin) => coin.marketCap * (price ?? 164.91) <= 4000
    );
    setFilteredCoins(regularFilteredCoins);
  };

  const topCoin =
    coins.length > 0
      ? coins.reduce((prev, current) =>
          prev.marketCap > current.marketCap ? prev : current
        )
      : null;

  const handleTradeClick = (token: Coin) => {
 
    setSelectedToken(token);

   
    navigate("/token-detail", {
      state: {
        tokenData: {
          id: token._id,
          name: token.name,
          symbol: token.ticker,
          imgUrl: token.imgUrl,
          token:token.token,
          marketCap: `${(token.marketCap * (price ?? 164.91)).toFixed(2)}`,
          price: token.price,
          change24h: token.change24h,
          volume24h: token.volume24h,
          description: token.description,
          ticker: token.ticker,
        },
      },
    });
   
  };

  const handleLaunchClick = () => {
    navigate("/create-token");
  };

  const Preloader = () => (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: loading ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        pointerEvents: loading ? "auto" : "none",
      }}
      onAnimationComplete={() =>
        !loading && (document.body.style.overflow = "auto")
      }
    >
      <div className="text-center">
        <h1
          className="text-4xl font-bold animate-pulse-opacity"
          style={{
            background: "linear-gradient(to right, #a855f7, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          memehome is getting ready.......
        </h1>
      </div>
    </motion.div>
  );

  const showPreloader = location.pathname === "/" && loading;

  if (error)
    return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {showPreloader && <Preloader />}
      <AnimatePresence>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                topCoin={topCoin}
                price={price}
                handleSearch={handleSearch}
                highMarketCapCoins={highMarketCapCoins}
                CoinCard={CoinCard}
             
                filteredCoins={filteredCoins}
                handleTradeClick={handleTradeClick}
                onLaunchClick={handleLaunchClick}
              />
            }
          />
          <Route
            path="/create-token"
            element={<CreateToken onClose={() => navigate("/")} />}
          />
          <Route
            path="/token-detail"
            element={
              <>
                <Navbar onLaunchClick={handleLaunchClick} />
                <TradePage
                  onBack={() => navigate("/")}
                  tokenData={selectedToken}
                  price={price}
                  // token={selectedToken.token} // if it's a property inside selectedToken

                
                />
              </>
            }
          />
        </Routes>
      </AnimatePresence>
      <Analytics />
    </div>
  );
}

export default App;