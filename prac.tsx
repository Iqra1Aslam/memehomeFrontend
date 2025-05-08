"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Settings, Check } from "lucide-react";
import {
  Connection,
  PublicKey,
  ParsedAccountData,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { BN } from "bn.js";
import {
  getBondingCurve,
  getCurveTokenAccount,
  getUserTokenAccount,
  configPda,
  calculateAmountBuy,
  calculateAmountSell,
  getTokenBalance,
 getLimit,
  getRealTokenReserves,
} from "../../utils/programFunction";
import { program, feeRecipt } from "../../utils/anchorClient";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import axios from "axios";
import { TradeModeSwitch } from "./TradeModeSwitch";
import { AmountInput } from "./AmountInput";
import { PresetButtons } from "./PresetButtons";
import { TradeButton } from "./TradeButton";
import { ProgressBar } from "./ProgressBar";
import { HoldersList } from "./HoldersList";
// import { io } from "socket.io-client";
import { channel } from "../../utils/ablyClient";
// const socket = io("https://server.memehome.io", {

//   withCredentials: true,

// });
const KEY = import.meta.env.VITE_API_HOLDERS;
const URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const QUICKNODE_RPC = `https://fragrant-frequent-hill.solana-devnet.quiknode.pro/${KEY}/`;

interface TokenData {
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
  creator?: {
    wallet: string;
  };
  _id?: string;
}

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface OHLCData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TokenTradingPanelProps {
  tokenData: TokenData & {
    bondingCurve?: string;
    imgName?: string;
    description?: string;
    progressValue?: number;
  };
  publicKey: PublicKey | null;
  connection: Connection;
  wallet: WalletContextState;
  id?: string;
  onChartDataUpdate: (data: CandlestickData[]) => void;
  onTradeSuccess: (tradeDetails: {
    tokenName: string;
    tradeType: "bought" | "sold";
    marketCap: string;
    amount: string;
    trades?: any[];
  }) => void;
}

interface Holder {
  address: string;
  percentage: string;
  fullAddress: string;
}

const TokenTradingPanel: React.FC<TokenTradingPanelProps> = ({
  tokenData,
  publicKey,
  connection,
  wallet,
  id,
  onChartDataUpdate,
  onTradeSuccess,
}) => {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bondingCurveProgress, setBondingCurveProgress] = useState<number>(0);
  const [isBuyActive, setIsBuyActive] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>("");
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [kothProgress, setKothProgress] = useState<number>(0);
  const [isEagleMode, setIsEagleMode] = useState<boolean>(false);
  const [isCurveCompleted, setIsCurveCompleted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false); // State to track if text is copied
  const [msg, setMsg] = useState<number>(0);
  const [isCurveComplete, setIsCurveComplete] = useState(false);

  const [marketCap, setMarketCap] = useState<string>(
    tokenData.marketCap || "$0"
  );
  const lastValidProgressRef = useRef(0); // persists across renders
  const lastValidKothProgressRef = useRef(0);
  

  const handleSwitchMode = () => {
    setIsEagleMode(!isEagleMode);
    setAmount("");
    setCalculatedAmount(0);
  };

 
  // Function to handle copy action
  const handleCopy = async () => {
    const textToCopy = tokenData.token ? tokenData.token : "BMivR...pump"; // Default text if token is not available
    try {
      await navigator.clipboard.writeText(textToCopy); // Copy text to clipboard
      setIsCopied(true); // Update state to indicate text is copied
      setTimeout(() => setIsCopied(false), 2000); // Reset state after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  const fetchTokenPrice = async () => {
    try {
      if (!tokenData.bondingCurve) return;
      const bid = tokenData.bondingCurve;
      // const price = await eachTokenPrice(tokenData.bondingCurve);
      const res = await axios.get(`${URL}coin/token-price/${bid}`);
      const price = res.data.price;
      setTokenPrice(price);
      console.log("tokenData.bondingCurve price", price);
    } catch (error) {
      console.error("Error fetching token price:", error);
    }
  };
  channel.subscribe("priceUpdate", (message) => {
    console.log("token updated bondingCurve price", message.data);
    setTokenPrice(message.data.price);
  });

  // channel.unsubscribe('coin-price', onMessage);
  useEffect(() => {
    fetchTokenPrice();
  }, [tokenData.bondingCurve]);

  useEffect(() => {
    fetchTokenPrice();
  }, [tokenData.bondingCurve]);
  const postPrice = async () => {
    try {
      if (!tokenData.bondingCurve) return marketCap;
      const bid = tokenData.bondingCurve;

      const ress = await axios.get(`${URL}coin/token-price/${bid}`);
      const updatedPrice = ress.data.price;
      setTokenPrice(updatedPrice);
      const res = await axios.post(`${URL}coin/api/price`, {
        price: updatedPrice,
        bondingCurve: tokenData.bondingCurve,
      });
      console.log("updataed price data", res.data);
      const totalSupply = 800_000_000;
      const calculatedMarketCap =
        (updatedPrice * totalSupply) / LAMPORTS_PER_SOL;
      const formattedMarketCap = `$${calculatedMarketCap.toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        }
      )}k`;
      setMarketCap(formattedMarketCap);

      // const newChartData = await fetchOHLCData();
      // onChartDataUpdate(newChartData);

      return formattedMarketCap;
    } catch (error) {
      console.error("Error posting updated price to backend:", error);
      return marketCap;
    }
  };

 

  const fetchData = async () => {
    try {
      setIsLoading(true);

      if (publicKey) {
        const balanceLamports = await connection.getBalance(publicKey);

        setBalance(balanceLamports / LAMPORTS_PER_SOL);

        const tokenBal = await getTokenBalance(
          publicKey.toBase58(),
          tokenData.token || ""
        );

        setTokenBalance(tokenBal || 0);
      } else {
        setBalance(0);
        setTokenBalance(0);
      }
      if (tokenData.bondingCurve && tokenData.token) {
        const totalSupply = 800_000_000;
        const bondingCurveBalance = await getRealTokenReserves(
          tokenData.bondingCurve
        );

        console.log(
          "realTokenReserves:",

          bondingCurveBalance,
          "curveLimit:",
          totalSupply
        );
       
        const bondingCurveAddress = new PublicKey(tokenData.bondingCurve);
        const tokenn = tokenData.bondingCurve;

        const resp = await axios.get(`${URL}coin/getSol/${tokenn}`);
        const bondingCurveSOL = resp.data.progress;

        console.log("Bonding Curve SOL Balance:", bondingCurveSOL);
        setMsg(bondingCurveSOL);
        if (bondingCurveBalance > 0) {
          const response = await axios.post(
            `${URL}coin/bonding-curve-progress`,
            {
              realTokenReserves: bondingCurveBalance,
              curveLimit: totalSupply,
            }
          );

          const progressPercentage = response.data.distributedPercentage;

          // Save last valid progress
          lastValidProgressRef.current = progressPercentage;
          console.log(
            "lastValidProgressRef.current",
            lastValidProgressRef.current
          );
          setBondingCurveProgress(progressPercentage);
        } else {
          // If realTokenReserves is 0, use the last saved progress
          setBondingCurveProgress(lastValidProgressRef.current);
          console.log(
            "Using last saved progress:",
            lastValidProgressRef.current
          );
        }

        const token = tokenData.bondingCurve;
        console.log("token", token);
        const res = await axios.get(`${URL}coin/getkoth/${token}`);

        const progressSet = Math.min(res.data.progress, 100);
        setKothProgress(progressSet);
      }
      if (tokenData.bondingCurve) {
      
        const limit = await getLimit(
          tokenData.bondingCurve
        );

        console.log(
          "curveLimit:",
           limit
        );
       
        setIsCurveComplete(limit);
        console.log("setIsCurveComplete  :",setIsCurveComplete);
      }

      if (tokenData.token) {
        try {
          const response = await axios.get(
            `${URL}user/coin/api/holders/${tokenData.token}`
          );
          const fetchedHolders = response.data;
          console.log("Fetched holders:", fetchedHolders);
          if (Array.isArray(fetchedHolders) && fetchedHolders.length > 0) {
            setHolders(fetchedHolders);
          } else {
            setErrorMsg("something went wrong");
            setHolders([]);
          }
        } catch (error) {
          console.error("Error fetching holders from API:", error);
          setErrorMsg("something went wrong");
          setHolders([]);
        }
      } else {
        setErrorMsg("something went wrong");
        setHolders([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMsg("something went wrong");
      setHolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [connection, id, tokenData.token, tokenData.bondingCurve]);

  useEffect(() => {
    const handleprogress = (message: any) => {
      console.log("Real-time B.C progress update (Ably):", message.data);
      setBondingCurveProgress(message.data.distributedPercentage);
    };

    channel.subscribe("progressGet", handleprogress);

    return () => {
      channel.unsubscribe("progressGet", handleprogress);
    };
  }, []);

  useEffect(() => {
    const handleSol = (message: any) => {
      console.log("Real-time Sol update (Ably):", message.data);
      // const progressSet = Math.min(res.data.progress, 100);
      setMsg(message.data.balance);
    };

    channel.subscribe("solGet", handleSol);

    return () => {
      channel.unsubscribe("solGet", handleSol);
    };
  }, []);

  useEffect(() => {
    const handleKothGet = (message: any) => {
      console.log("Real-time koth progress update (Ably):", message.data);
      setKothProgress(Math.min(message.data.koth, 100));
    };

    channel.subscribe("kothGet", handleKothGet);

    return () => {
      channel.unsubscribe("kothGet", handleKothGet);
    };
  }, []);

  useEffect(() => {
    const handleTokenHolders = (message: any) => {
      console.log("Real-time token holders update (Ably):", message.data);
      setHolders(message.data.formattedHolders); // Update state with the list of top holders
    };

    channel.subscribe("tokenHolders", handleTokenHolders);

    return () => {
      channel.unsubscribe("tokenHolders", handleTokenHolders);
    };
  }, []);

  const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (!isNaN(Number(value)) && value !== "" && tokenData.bondingCurve) {
      let result;
      if (isEagleMode) {
        // In eagle mode: input is SOL for buy, tokens for sell
        result = isBuyActive
          ? await calculateAmountSell(Number(value), tokenData.bondingCurve) // Input SOL, get tokens
          : await calculateAmountBuy(Number(value), tokenData.bondingCurve); // Input SOL, get tokens
      } else {
        // In normal mode: input is SOL for buy, tokens for sell
        result = isBuyActive
          ? await calculateAmountBuy(Number(value), tokenData.bondingCurve) // Input SOL, get tokens
          : await calculateAmountSell(Number(value), tokenData.bondingCurve); // Input tokens, get SOL
      }
      if (typeof result === "string") {
        setIsCurveCompleted(true);
        setCalculatedAmount(0);
      } else {
        setIsCurveCompleted(false);
        // Adjust calculated amount based on mode and action
        setCalculatedAmount(
          isEagleMode && !isBuyActive
            ? result // Eagle mode sell: show tokens
            : isEagleMode && isBuyActive
            ? result // Eagle mode buy: show tokens
            : !isEagleMode && !isBuyActive
            ? result // Normal mode sell: show SOL
            : result // Normal mode buy: show tokens
        );
      }
    } else {
      setCalculatedAmount(0);
      setIsCurveCompleted(false);
    }
  };

  const handlePresetAmount = (value: string) => {
    if (value === "max") {
      const maxValue = isEagleMode
        ? tokenBalance.toString()
        : balance.toString();
      setAmount(maxValue);
      handleAmountChange({ target: { value: maxValue } } as any);
    } else {
      setAmount(value);
      handleAmountChange({ target: { value } } as any);
    }
  };

  const handleTrade = useCallback(
    async (value: number) => {
      if (!value || !tokenData.token || !publicKey || isCurveCompleted) return;

      setIsTrading(true);

      try {
        const bondingCurvePda = await getBondingCurve(tokenData.token);
        const amountBN = new BN(value * 1_000_000);
        const curveTokenAccount = await getCurveTokenAccount(
          tokenData.token,
          tokenData.bondingCurve || ""
        );
        const userTokenAccount = await getUserTokenAccount(
          tokenData.token,
          publicKey
        );

        const instruction = await program.methods
          .swap(amountBN, isBuyActive ? 0 : 1, new BN(calculatedAmount))
          .accounts({
            user: publicKey,
            globalConfig: configPda,
            feeRecipient: feeRecipt.publicKey,
            bondingCurve: bondingCurvePda,
            tokenMint: new PublicKey(tokenData.token),
            curveTokenAccount,
            userTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const transaction = new Transaction().add(instruction);
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        const signedTransaction = await wallet.signTransaction!(transaction);
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );

        await connection.confirmTransaction(signature, "confirmed");

        // Prepare onTradeSuccess data
        const tradeSuccessData = {
          tokenName: tokenData.name,
          tradeType: isBuyActive ? "bought" : "sold",
          marketCap: marketCap,
          amount: isBuyActive
            ? `${value} SOL`
            : `${calculatedAmount} ${tokenData.ticker}`,
        };

        try {
          await axios.post(`${URL}coin/api/trade-success`, tradeSuccessData);
          console.log("succes posted", tradeSuccessData);
        } catch (error) {
          console.error("Error posting trade success data:", error);
        }

        const updatedMarketCap = await postPrice();
        await fetchData();

        const tradeData = {
          account: publicKey.toBase58(),
          type: isBuyActive ? "buy" : "sell",
          tokenAmount: isBuyActive ? calculatedAmount : value,
          solAmount: isBuyActive ? value : calculatedAmount,
          txHex: signature,
          tokenAddress: tokenData.token,
        };

        try {
          await axios.post(`${URL}coin/api/trades`, tradeData);
          console.log("Trade data posted successfully:", tradeData);
          const response = await axios.get(
            `${URL}coin/api/trades/${tokenData.token}`
          );
          const trades = response.data.trades || [];

          onTradeSuccess({
            tokenName: tokenData.name,
            tradeType: isBuyActive ? "bought" : "sold",
            marketCap: updatedMarketCap,
            amount: isBuyActive
              ? `${value} SOL`
              : `${calculatedAmount} ${tokenData.ticker}`,
            trades,
          });
        } catch (apiError) {
          console.error("Error handling trade API calls:", apiError);
        }
      } catch (error) {
        console.error("Trade execution error:", error);
      } finally {
        setIsTrading(false);
      }
    },
    [
      publicKey,
      connection,
      wallet,
      tokenData,
      calculatedAmount,
      isBuyActive,
      onTradeSuccess,
      marketCap,
      isCurveCompleted,
    ]
  );


  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30 shadow-md shadow-purple-500/20">
          <img
            src={tokenData.imgUrl || "/placeholder.svg"}
            alt={tokenData.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
            {tokenData.name}
          </h3>
          <p className="text-gray-400 text-sm">
            {tokenData.symbol} • {marketCap}
          </p>
        </div>
      </div>
      {isCurveCompleted && (
        <div className="mb-4 text-center text-purple-400 font-semibold">
          Listed on Raydium!
        </div>
      )}
      
      {!isCurveCompleted && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsBuyActive(true)}
            className={`py-3 rounded-lg ${
              isBuyActive
                ? "bg-gradient-to-r from-green-500 to-green-400 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Buy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsBuyActive(false)}
            className={`py-3 rounded-lg ${
              !isBuyActive
                ? "bg-gradient-to-r from-red-500 to-red-400 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Sell
          </motion.button>
        </div>
      )}
      {!isCurveCompleted && (
        <div className="flex items-center justify-between mb-4">
          <TradeModeSwitch
            isEagleMode={isEagleMode}
            handleSwitchMode={handleSwitchMode}
            ticker={tokenData.ticker}
          />
          
        </div>
      )}
      <div className="mb-4 text-sm text-gray-300">
        {isBuyActive ? (
          <span>Balance: {balance.toFixed(2)} SOL</span>
        ) : (
          <span>Token Balance: {Math.round(tokenBalance)} tokens</span>
        )}
      </div>
      {!isCurveCompleted && (
        <>
          <AmountInput
            amount={amount}
            handleAmountChange={handleAmountChange}
            isEagleMode={isEagleMode}
            ticker={tokenData.ticker}
          />
          <PresetButtons
            isBuyActive={isBuyActive}
            handlePresetAmount={handlePresetAmount}
            balance={balance}
            tokenBalance={tokenBalance}
            isEagleMode={isEagleMode}
            ticker={tokenData.ticker}
          />
        </>
      )}
      {calculatedAmount > 0 && !isCurveCompleted && (
        <div className="mb-4 text-center">
          <span className="text-lg text-green-400">
            {isEagleMode
              ? isBuyActive
                ? // Eagle mode buy: input SOL, output tokens
                  `${calculatedAmount.toFixed(2)} ${tokenData.ticker}`
                : // Eagle mode sell: input SOL, output tokens
                  `${calculatedAmount.toFixed(2)} ${tokenData.ticker}`
              : isBuyActive
              ? // Normal mode buy: input SOL, output tokens
                `${calculatedAmount.toFixed(2)} ${tokenData.ticker}`
              : // Normal mode sell: input tokens, output SOL
                `${calculatedAmount.toFixed(8)} SOL`}
          </span>
        </div>
      )}
      <div className="mb-4 text-sm text-white">
        <span>Token Price: </span>
        <motion.span
          key={tokenPrice}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-purple-400"
        >
          {tokenPrice.toFixed(10)} SOL
        </motion.span>
      </div>
      {!isCurveCompleted && (
        <TradeButton
          isTrading={isTrading}
          isBuyActive={isBuyActive}
          publicKey={publicKey}
          handleTrade={handleTrade}
          amount={amount}
          calculatedAmount={calculatedAmount}
          isEagleMode={isEagleMode}
        />
      )}
       {!isCurveComplete && (
        <div className="text-gray-300 text-xs ">
           there is {(typeof msg === 'number' ? msg.toFixed(2) : '0.00')} SOL in the bonding curve.
           </div>
      )}
    <ProgressBar
  title="bonding curve progress"
  // msg={`there is ${(typeof msg === 'number' ? msg.toFixed(2) : '0.00')} SOL in the bonding curve.`}
  progress={bondingCurveProgress}
  gradientFrom="from-blue-500"
  gradientTo="to-cyan-400"
  shadowColor="shadow-blue-500/30"
/>
      <ProgressBar
        title="King of the hill progress"
        progress={kothProgress}
        gradientFrom="from-yellow-500"
        gradientTo="to-yellow-300"
        shadowColor="shadow-yellow-500/30"
        description="Dethrone the current king at $26,256 market cap."
      />
      <div className="flex items-center justify-between mb-4 bg-black/30 p-2 rounded-lg">
        <span className="text-gray-400 text-sm">Contract address:</span>
        {/* <div className="flex items-center space-x-1">
          <span className="text-purple-400 text-sm">
            {tokenData.token
              ? `${tokenData.token.substring(0, 6)}...`
              : "BMivR...pump"}
          </span>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Copy size={14} />
          </motion.button>
        </div> */}
        <div className="flex items-center space-x-1">
          {/* Display the token (truncated if necessary) */}
          <span className="text-purple-400 text-sm">
            {tokenData.token
              ? `${tokenData.token.substring(0, 6)}...`
              : "BMivR...pump"}
          </span>

          {/* Copy Button with Icon Toggle */}
          <motion.button
            onClick={handleCopy} // Attach the copy handler
            className="text-gray-400 hover:text-white transition-colors"
          >
            {/* Conditionally render the Copy or Check icon */}
            {isCopied ? (
              <Check size={14} className="text-green-500" /> // Check icon when copied
            ) : (
              <Copy size={14} /> // Copy icon by default
            )}
          </motion.button>
        </div>
      </div>
      <HoldersList
        holders={holders}
        isLoading={isLoading}
        bondingCurve={tokenData.bondingCurve}
        creatorWallet={tokenData.creator?.wallet} // Pass creator wallet if available
      />
      {tokenData.description && (
        <div className="mt-4">
          <p className="text-gray-300">
            <strong>
              {tokenData.name} ({tokenData.ticker}):
            </strong>{" "}
            {tokenData.description}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TokenTradingPanel;
