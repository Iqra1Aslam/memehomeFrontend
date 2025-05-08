// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { Minimize, Maximize } from "lucide-react";
// import * as LightweightCharts from "lightweight-charts";
// import axios from "axios";
// import { ably } from "../../utils/ablyClient";

// const URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

// interface ChartButtonProps {
//   icon: React.ReactNode;
//   onClick: () => void;
// }

// const ChartButton: React.FC<ChartButtonProps> = ({ icon, onClick }) => (
//   <button
//     onClick={onClick}
//     className="p-2 text-gray-400 hover:text-white transition-colors"
//   >
//     {icon}
//   </button>
// );

// interface TokenData {
//   change24h: string;
//   bondingCurve?: string;
// }

// interface CandlestickData {
//   time: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface OHLCData {
//   timestamp: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface ChartSectionProps {
//   tokenData: TokenData;
// }

// const ChartSection: React.FC<ChartSectionProps> = ({ tokenData }) => {
//   const [ohlcValues, setOhlcValues] = useState({
//     open: "0",
//     high: "0",
//     low: "0",
//     close: "0",
//   });
//   const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [chartData, setChartData] = useState<CandlestickData[]>([]);
//   const [selectedInterval, setSelectedInterval] = useState<"5min" | "hour">(
//     "hour"
//   );
//   const [selectedRange, setSelectedRange] = useState<
//     "24h" | "3d" | "7d" | "30d"
//   >("24h");
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);
//   const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
//   const candleSeriesRef =
//     useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);

//   const convertScientificToDecimal = (value: number): number =>
//     parseFloat(value.toFixed(16));

//   const calculateStartTime = (range: "24h" | "3d" | "7d" | "30d") => {
//     const now = new Date();
//     switch (range) {
//       case "24h":
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//       case "3d":
//         return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
//       case "7d":
//         return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       case "30d":
//         return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
//       default:
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//     }
//   };

//   const fetchOHLCData = async (
//     interval: "5min" | "hour",
//     range: "24h" | "3d" | "7d" | "30d"
//   ): Promise<CandlestickData[]> => {
//     if (!tokenData.bondingCurve) {
//       console.log("No bondingCurve provided in tokenData");
//       return [];
//     }
//     try {
//       const startTime = calculateStartTime(range);
//       const response = await axios.get(`${URL}coin/api/price/ohlc`, {
//         params: {
//           interval,
//           startTime,
//           bondingCurve: tokenData.bondingCurve,
//         },
//       });
//       if (!Array.isArray(response.data) || response.data.length === 0) {
//         console.log(`No ${interval} OHLC data returned from API for ${range}`);
//         return [];
//       }
//       const mappedData = response.data.map((item: OHLCData) => ({
//         time: Math.floor(new Date(item.timestamp).getTime() / 1000),
//         open: convertScientificToDecimal(item.open),
//         high: convertScientificToDecimal(item.high),
//         low: convertScientificToDecimal(item.low),
//         close: convertScientificToDecimal(item.close),
//       }));
//       return mappedData;
//     } catch (error) {
//       console.error(
//         `Error fetching ${interval} OHLC data for ${range}:`,
//         error
//       );
//       return [];
//     }
//   };

//   useEffect(() => {
//     if (!tokenData.bondingCurve) {
//       console.log("Skipping fetch: No bondingCurve");
//       return;
//     }

//     fetchOHLCData(selectedInterval, selectedRange).then((data) => {
//       setChartData(data);
//     });

//     const channel = ably.channels.get("coins");

//     const onPriceUpdate = (message: any) => {
//       const data = message.data as {
//         bondingCurve: string;
//         price: number;
//         timestamp: string;
//       };
//       console.log("Received Ably priceUpdate message:", message);

//       if (data.bondingCurve === tokenData.bondingCurve) {
//         const newCandle: CandlestickData = {
//           time: Math.floor(new Date(data.timestamp).getTime() / 1000),
//           open: data.price,
//           high: data.price,
//           low: data.price,
//           close: data.price,
//         };

//         setChartData((prevData) => {
//           const lastCandle = prevData[prevData.length - 1];
//           if (lastCandle && lastCandle.time === newCandle.time) {
//             const updatedCandle = {
//               ...lastCandle,
//               high: Math.max(lastCandle.high, newCandle.close),
//               low: Math.min(lastCandle.low, newCandle.close),
//               close: newCandle.close,
//             };
//             return [...prevData.slice(0, -1), updatedCandle];
//           } else {
//             return [...prevData, newCandle];
//           }
//         });
//       }
//     };

//     channel.subscribe("priceUpdate", onPriceUpdate);

//     return () => {
//       channel.unsubscribe("priceUpdate", onPriceUpdate);
//     };
//   }, [tokenData.bondingCurve, selectedInterval, selectedRange]);

//   const chartProperties = {
//     width: window.innerWidth,
//     height: window.innerHeight,
//     timeScale: {
//       timeVisible: true,
//       secondsVisible: false,
//       fitContent: false,
//       rightOffset: 10,
//     },
//     crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
//     layout: { backgroundColor: "#000000", textColor: "#ffffff" },
//     grid: { horzLines: { color: "#2e2e2e" }, vertLines: { color: "#2e2e2e" } },
//     rightPriceScale: {
//       borderColor: "#2e2e2e",
//       autoScale: true,
//       scaleMargins: { top: 0.2, bottom: 0.2 },
//       priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       alignLabels: true,
//       entireTextOnly: true,
//     },
//   };

//   useEffect(() => {
//     if (!chartContainerRef.current || chartData.length === 0) return;

//     if (!chartInstanceRef.current) {
//       const chart = LightweightCharts.createChart(chartContainerRef.current, {
//         ...chartProperties,
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//       });
//       chartInstanceRef.current = chart;

//       const candleSeries = chart.addCandlestickSeries({
//         upColor: "#4bff5c",
//         downColor: "#ff4b4b",
//         borderUpColor: "#4bff5c",
//         borderDownColor: "#ff4b4b",
//         wickUpColor: "#4bff5c",
//         wickDownColor: "#ff4b4b",
//         priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       });
//       candleSeriesRef.current = candleSeries;
//     }

//     if (candleSeriesRef.current) {
//       candleSeriesRef.current.setData(chartData);
//       const lastCandle = chartData[chartData.length - 1];
//       setOhlcValues({
//         open: lastCandle.open.toFixed(10),
//         high: lastCandle.high.toFixed(10),
//         low: lastCandle.low.toFixed(10),
//         close: lastCandle.close.toFixed(10),
//       });
//     }

//     const chart = chartInstanceRef.current!;
//     chart.subscribeCrosshairMove((param) => {
//       if (!param.time || !candleSeriesRef.current) {
//         const lastCandle = chartData[chartData.length - 1];
//         setOhlcValues({
//           open: lastCandle.open.toFixed(10),
//           high: lastCandle.high.toFixed(10),
//           low: lastCandle.low.toFixed(10),
//           close: lastCandle.close.toFixed(10),
//         });
//         setHoveredPrice(null);
//         return;
//       }

//       const price = candleSeriesRef.current.coordinateToPrice(param.point!.y);
//       if (price) setHoveredPrice(price.toFixed(10));

//       const candleData = chartData.find((candle) => candle.time === param.time);
//       if (candleData) {
//         setOhlcValues({
//           open: candleData.open.toFixed(10),
//           high: candleData.high.toFixed(10),
//           low: candleData.low.toFixed(10),
//           close: candleData.close.toFixed(10),
//         });
//       }
//     });

//     chart.timeScale().applyOptions({ rightOffset: 10, barSpacing: 10 });
//     chart.priceScale("right").applyOptions({
//       autoScale: true,
//       scaleMargins: { top: 0.2, bottom: 0.2 },
//     });
//     chart.timeScale().fitContent();

//     const handleResize = () => {
//       if (
//         chartInstanceRef.current &&
//         chartContainerRef.current &&
//         headerRef.current
//       ) {
//         const headerHeight = headerRef.current.clientHeight || 0;
//         const availableHeight = isFullScreen
//           ? window.innerHeight - headerHeight
//           : chartContainerRef.current.clientHeight;
//         const availableWidth = isFullScreen
//           ? window.innerWidth
//           : chartContainerRef.current.clientWidth;
//         chartInstanceRef.current.applyOptions({
//           width: availableWidth,
//           height: availableHeight,
//         });
//         chartInstanceRef.current.timeScale().fitContent();
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.unsubscribeCrosshairMove(() => {});
//         chartInstanceRef.current.remove();
//         chartInstanceRef.current = null;
//         candleSeriesRef.current = null;
//       }
//     };
//   }, [chartData, isFullScreen]);

//   const toggleFullScreen = () => {
//     if (!chartRef.current) return;
//     if (!document.fullscreenElement) {
//       chartRef.current.requestFullscreen({ navigationUI: "auto" }).then(() => {
//         setIsFullScreen(true);
//         if (
//           chartInstanceRef.current &&
//           chartContainerRef.current &&
//           headerRef.current
//         ) {
//           const headerHeight = headerRef.current.clientHeight || 0;
//           chartContainerRef.current.style.width = "100vw";
//           chartContainerRef.current.style.height = `${
//             window.innerHeight - headerHeight
//           }px`;
//           chartInstanceRef.current.applyOptions({
//             width: window.innerWidth,
//             height: window.innerHeight - headerHeight,
//           });
//           chartInstanceRef.current.timeScale().fitContent();
//         }
//       });
//     } else {
//       document.exitFullscreen().then(() => {
//         setIsFullScreen(false);
//         if (chartInstanceRef.current && chartContainerRef.current) {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//           chartInstanceRef.current.applyOptions({
//             width: chartContainerRef.current.clientWidth,
//             height: chartContainerRef.current.clientHeight,
//           });
//           chartInstanceRef.current.timeScale().fitContent();
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       const isNowFullScreen = !!document.fullscreenElement;
//       setIsFullScreen(isNowFullScreen);
//       if (
//         chartInstanceRef.current &&
//         chartContainerRef.current &&
//         headerRef.current
//       ) {
//         const headerHeight = headerRef.current.clientHeight || 0;
//         if (isNowFullScreen) {
//           chartContainerRef.current.style.width = "100vw";
//           chartContainerRef.current.style.height = `${
//             window.innerHeight - headerHeight
//           }px`;
//           chartInstanceRef.current.applyOptions({
//             width: window.innerWidth,
//             height: window.innerHeight - headerHeight,
//           });
//         } else {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//           chartInstanceRef.current.applyOptions({
//             width: chartContainerRef.current.clientWidth,
//             height: chartContainerRef.current.clientHeight,
//           });
//         }
//         chartInstanceRef.current.timeScale().fitContent();
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () =>
//       document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.1 }}
//       className={`bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5 ${
//         isFullScreen
//           ? "fixed inset-0 z-50 m-0 p-0 h-screen w-screen flex flex-col"
//           : ""
//       }`}
//       ref={chartRef}
//     >
//       <div
//         ref={headerRef}
//         className={`flex flex-col mb-4 gap-3 ${
//           isFullScreen ? "px-4 pt-4" : ""
//         }`}
//       >
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-4 flex-wrap">
//             {/* View Dropdown */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">View:</span>
//               <select
//                 value={selectedInterval}
//                 onChange={(e) =>
//                   setSelectedInterval(e.target.value as "5min" | "hour")
//                 }
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="5min">5m</option>
//                 <option value="hour">1h</option>
//               </select>
//             </div>
//             {/* Change Dropdown */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">Change:</span>
//               <select
//                 value={selectedRange}
//                 onChange={(e) =>
//                   setSelectedRange(
//                     e.target.value as "24h" | "3d" | "7d" | "30d"
//                   )
//                 }
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="24h">24h</option>
//                 <option value="3d">3d</option>
//                 <option value="7d">7d</option>
//                 <option value="30d">30d</option>
//               </select>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-gray-800/50">
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">O:</span>
//                 <span className="text-green-400 font-mono text-xs">
//                   {ohlcValues.open}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">H:</span>
//                 <span className="text-white font-mono text-xs">
//                   {ohlcValues.high}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">L:</span>
//                 <span className="text-white font-mono text-xs">
//                   {ohlcValues.low}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">C:</span>
//                 <span className="text-white font-mono text-xs">
//                   {ohlcValues.close}
//                 </span>
//               </div>
//             </div>
//             <ChartButton
//               icon={
//                 isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />
//               }
//               onClick={toggleFullScreen}
//             />
//             {/* <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-gray-800/50">
//               <span className="text-gray-500 text-xs">24h:</span>
//               <span className="text-green-400 font-semibold text-xs">{tokenData.change24h}</span>
//             </div> */}
//           </div>
//         </div>
//       </div>
//       <div
//         className={`relative flex-1 bg-black/40 rounded-xl border border-gray-800 overflow-hidden ${
//           isFullScreen ? "h-auto" : "h-72 md:h-96"
//         }`}
//       >
//         {chartData.length > 0 ? (
//           <>
//             {hoveredPrice && (
//               <div
//                 className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-md text-sm"
//                 style={{ pointerEvents: "none" }}
//               >
//                 {hoveredPrice}
//               </div>
//             )}
//             <div
//               ref={chartContainerRef}
//               style={{ width: "100%", height: "100%", cursor: "crosshair" }}
//             />
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <p className="text-sm">No trades have happened</p>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default ChartSection;




// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { Minimize, Maximize } from "lucide-react";
// import * as LightweightCharts from "lightweight-charts";
// import axios from "axios";
// import { ably } from "../../utils/ablyClient";

// const URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

// interface ChartButtonProps {
//   icon: React.ReactNode;
//   onClick: () => void;
// }

// const ChartButton: React.FC<ChartButtonProps> = ({ icon, onClick }) => (
//   <button
//     onClick={onClick}
//     className="p-2 text-gray-400 hover:text-white transition-colors"
//   >
//     {icon}
//   </button>
// );

// interface TokenData {
//   change24h: string;
//   bondingCurve?: string;
// }

// interface CandlestickData {
//   time: LightweightCharts.Time;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface OHLCData {
//   timestamp: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface ChartSectionProps {
//   tokenData: TokenData;
// }

// const ChartSection: React.FC<ChartSectionProps> = ({ tokenData }) => {
//   const [ohlcValues, setOhlcValues] = useState({
//     open: "0",
//     high: "0",
//     low: "0",
//     close: "0",
//   });
//   const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [chartData, setChartData] = useState<CandlestickData[]>([]);
//   const [selectedInterval, setSelectedInterval] = useState<"5min" | "hour">(
//     "hour"
//   );
//   const [selectedRange, setSelectedRange] = useState<
//     "24h" | "3d" | "7d" | "30d"
//   >("24h");
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);
//   const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
//   const candleSeriesRef =
//     useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);

//   const convertScientificToDecimal = (value: number): number =>
//     parseFloat(value.toFixed(16));

//   const calculateStartTime = (range: "24h" | "3d" | "7d" | "30d") => {
//     const now = new Date();
//     switch (range) {
//       case "24h":
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//       case "3d":
//         return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
//       case "7d":
//         return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       case "30d":
//         return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
//       default:
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//     }
//   };

//   const fetchOHLCData = async (
//     interval: "5min" | "hour",
//     range: "24h" | "3d" | "7d" | "30d"
//   ): Promise<CandlestickData[]> => {
//     if (!tokenData.bondingCurve) {
//       console.log("No bondingCurve provided in tokenData");
//       return [];
//     }
//     try {
//       const startTime = calculateStartTime(range);
//       const response = await axios.get(`${URL}coin/api/price/ohlc`, {
//         params: {
//           interval,
//           startTime,
//           bondingCurve: tokenData.bondingCurve,
//         },
//       });
//       if (!Array.isArray(response.data) || response.data.length === 0) {
//         console.log(`No ${interval} OHLC data returned from API for ${range}`);
//         return [];
//       }
//       const mappedData = response.data.map((item: OHLCData) => ({
//         time: Math.floor(
//           new Date(item.timestamp).getTime() / 1000
//         ) as LightweightCharts.Time,
//         open: convertScientificToDecimal(item.open),
//         high: convertScientificToDecimal(item.high),
//         low: convertScientificToDecimal(item.low),
//         close: convertScientificToDecimal(item.close),
//       }));
//       return mappedData;
//     } catch (error) {
//       console.error(
//         `Error fetching ${interval} OHLC data for ${range}:`,
//         error
//       );
//       return [];
//     }
//   };

//   useEffect(() => {
//     if (!tokenData.bondingCurve) {
//       console.log("Skipping fetch: No bondingCurve");
//       return;
//     }

//     fetchOHLCData(selectedInterval, selectedRange).then((data) => {
//       setChartData(data);
//     });

//     const channel = ably.channels.get("coins");

//     const onPriceUpdate = (message: any) => {
//       const data = message.data as {
//         bondingCurve: string;
//         price: number;
//         timestamp: string;
//       };
//       console.log("Received Ably priceUpdate message:", message);

//       if (data.bondingCurve === tokenData.bondingCurve) {
//         const newCandle: CandlestickData = {
//           time: Math.floor(
//             new Date(data.timestamp).getTime() / 1000
//           ) as LightweightCharts.Time,
//           open: data.price,
//           high: data.price,
//           low: data.price,
//           close: data.price,
//         };

//         setChartData((prevData) => {
//           const lastCandle = prevData[prevData.length - 1];
//           if (lastCandle && lastCandle.time === newCandle.time) {
//             const updatedCandle = {
//               ...lastCandle,
//               high: Math.max(lastCandle.high, newCandle.close),
//               low: Math.min(lastCandle.low, newCandle.close),
//               close: newCandle.close,
//             };
//             return [...prevData.slice(0, -1), updatedCandle];
//           } else {
//             return [...prevData, newCandle];
//           }
//         });
//       }
//     };

//     channel.subscribe("priceUpdate", onPriceUpdate);

//     return () => {
//       channel.unsubscribe("priceUpdate", onPriceUpdate);
//     };
//   }, [tokenData.bondingCurve, selectedInterval, selectedRange]);

//   const chartProperties = {
//     width: window.innerWidth,
//     height: window.innerHeight,
//     timeScale: {
//       timeVisible: true,
//       secondsVisible: false,
//       fitContent: false,
//       rightOffset: 10,
//     },
//     crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
//     layout: { backgroundColor: "#000000", textColor: "#ffffff" },
//     grid: { horzLines: { color: "#2e2e2e" }, vertLines: { color: "#2e2e2e" } },
//     rightPriceScale: {
//       borderColor: "#2e2e2e",
//       autoScale: true,
//       scaleMargins: { top: 0.2, bottom: 0.2 },
//       priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       alignLabels: true,
//       entireTextOnly: true,
//     },
//   };

//   useEffect(() => {
//     if (!chartContainerRef.current || chartData.length === 0) return;

//     if (!chartInstanceRef.current) {
//       const chart = LightweightCharts.createChart(chartContainerRef.current, {
//         ...chartProperties,
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//       });
//       chartInstanceRef.current = chart;

//       const candleSeries = chart.addCandlestickSeries({
//         upColor: "#4bff5c",
//         downColor: "#ff4b4b",
//         borderUpColor: "#4bff5c",
//         borderDownColor: "#ff4b4b",
//         wickUpColor: "#4bff5c",
//         wickDownColor: "#ff4b4b",
//         priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       });
//       candleSeriesRef.current = candleSeries;
//     }

//     if (candleSeriesRef.current) {
//       candleSeriesRef.current.setData(chartData);
//       const lastCandle = chartData[chartData.length - 1];
//       setOhlcValues({
//         open: lastCandle.open.toFixed(10),
//         high: lastCandle.high.toFixed(10),
//         low: lastCandle.low.toFixed(10),
//         close: lastCandle.close.toFixed(10),
//       });
//     }

//     const chart = chartInstanceRef.current!;
//     chart.subscribeCrosshairMove((param) => {
//       if (!param.time || !candleSeriesRef.current) {
//         const lastCandle = chartData[chartData.length - 1];
//         setOhlcValues({
//           open: lastCandle.open.toFixed(10),
//           high: lastCandle.high.toFixed(10),
//           low: lastCandle.low.toFixed(10),
//           close: lastCandle.close.toFixed(10),
//         });
//         setHoveredPrice(null);
//         return;
//       }

//       const price = candleSeriesRef.current.coordinateToPrice(param.point!.y);
//       if (price) setHoveredPrice(price.toFixed(10));

//       const candleData = chartData.find((candle) => candle.time === param.time);
//       if (candleData) {
//         setOhlcValues({
//           open: candleData.open.toFixed(10),
//           high: candleData.high.toFixed(10),
//           low: candleData.low.toFixed(10),
//           close: candleData.close.toFixed(10),
//         });
//       }
//     });

//     chart.timeScale().applyOptions({ rightOffset: 10, barSpacing: 10 });
//     chart.priceScale("right").applyOptions({
//       autoScale: true,
//       scaleMargins: { top: 0.2, bottom: 0.2 },
//     });
//     chart.timeScale().fitContent();

//     const handleResize = () => {
//       if (
//         chartInstanceRef.current &&
//         chartContainerRef.current &&
//         headerRef.current
//       ) {
//         const headerHeight = headerRef.current.clientHeight || 0;
//         const availableHeight = isFullScreen
//           ? window.innerHeight - headerHeight
//           : chartContainerRef.current.clientHeight;
//         const availableWidth = isFullScreen
//           ? window.innerWidth
//           : chartContainerRef.current.clientWidth;
//         chartInstanceRef.current.applyOptions({
//           width: availableWidth,
//           height: availableHeight,
//         });
//         chartInstanceRef.current.timeScale().fitContent();
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.unsubscribeCrosshairMove(() => {});
//         chartInstanceRef.current.remove();
//         chartInstanceRef.current = null;
//         candleSeriesRef.current = null;
//       }
//     };
//   }, [chartData, isFullScreen]);

//   const toggleFullScreen = () => {
//     if (!chartRef.current) return;
//     if (!document.fullscreenElement) {
//       chartRef.current.requestFullscreen({ navigationUI: "auto" }).then(() => {
//         setIsFullScreen(true);
//         if (
//           chartInstanceRef.current &&
//           chartContainerRef.current &&
//           headerRef.current
//         ) {
//           const headerHeight = headerRef.current.clientHeight || 0;
//           chartContainerRef.current.style.width = "100vw";
//           chartContainerRef.current.style.height = `${
//             window.innerHeight - headerHeight
//           }px`;
//           chartInstanceRef.current.applyOptions({
//             width: window.innerWidth,
//             height: window.innerHeight - headerHeight,
//           });
//           chartInstanceRef.current.timeScale().fitContent();
//         }
//       });
//     } else {
//       document.exitFullscreen().then(() => {
//         setIsFullScreen(false);
//         if (chartInstanceRef.current && chartContainerRef.current) {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//           chartInstanceRef.current.applyOptions({
//             width: chartContainerRef.current.clientWidth,
//             height: chartContainerRef.current.clientHeight,
//           });
//           chartInstanceRef.current.timeScale().fitContent();
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       const isNowFullScreen = !!document.fullscreenElement;
//       setIsFullScreen(isNowFullScreen);
//       if (
//         chartInstanceRef.current &&
//         chartContainerRef.current &&
//         headerRef.current
//       ) {
//         const headerHeight = headerRef.current.clientHeight || 0;
//         if (isNowFullScreen) {
//           chartContainerRef.current.style.width = "100vw";
//           chartContainerRef.current.style.height = `${
//             window.innerHeight - headerHeight
//           }px`;
//           chartInstanceRef.current.applyOptions({
//             width: window.innerWidth,
//             height: window.innerHeight - headerHeight,
//           });
//         } else {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//           chartInstanceRef.current.applyOptions({
//             width: chartContainerRef.current.clientWidth,
//             height: chartContainerRef.current.clientHeight,
//           });
//         }
//         chartInstanceRef.current.timeScale().fitContent();
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () =>
//       document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.1 }}
//       className={`bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5 ${
//         isFullScreen
//           ? "fixed inset-0 z-50 m-0 p-0 h-screen w-screen flex flex-col"
//           : ""
//       }`}
//       ref={chartRef}
//     >
//       <div
//         ref={headerRef}
//         className={`flex flex-col mb-4 gap-3 ${
//           isFullScreen ? "px-4 pt-4" : ""
//         }`}
//       >
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-4 flex-wrap">
//             {/* View Dropdown */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">View:</span>
//               <select
//                 value={selectedInterval}
//                 onChange={(e) =>
//                   setSelectedInterval(e.target.value as "5min" | "hour")
//                 }
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="5min">5m</option>
//                 <option value="hour">1h</option>
//               </select>
//             </div>
//             {/* Change Dropdown */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">Change:</span>
//               <select
//                 value={selectedRange}
//                 onChange={(e) =>
//                   setSelectedRange(
//                     e.target.value as "24h" | "3d" | "7d" | "30d"
//                   )
//                 }
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="24h">24h</option>
//                 <option value="3d">3d</option>
//                 <option value="7d">7d</option>
//                 <option value="30d">30d</option>
//               </select>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-gray-800/50">
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">O:</span>
//                 <span className="text-green-400 font-mono text-xs">
//                   {ohlcValues.open}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">H:</span>
//                 <span className="text-white font-mono text-xs">
//                   {ohlcValues.high}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">L:</span>
//                 <span className="text-white font-mono text-xs">
//                   {ohlcValues.low}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">C:</span>
//                 <span className="text-white font-mono text-xs">
//                   {ohlcValues.close}
//                 </span>
//               </div>
//             </div>
//             <ChartButton
//               icon={
//                 isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />
//               }
//               onClick={toggleFullScreen}
//             />
//           </div>
//         </div>
//       </div>
//       <div
//         className={`relative flex-1 bg-black/40 rounded-xl border border-gray-800 overflow-hidden ${
//           isFullScreen ? "h-auto" : "h-72 md:h-96"
//         }`}
//       >
//         {chartData.length > 0 ? (
//           <>
//             {hoveredPrice && (
//               <div
//                 className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-md text-sm"
//                 style={{ pointerEvents: "none" }}
//               >
//                 {hoveredPrice}
//               </div>
//             )}
//             <div
//               ref={chartContainerRef}
//               style={{ width: "100%", height: "100%", cursor: "crosshair" }}
//             />
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <p className="text-sm">No trades have happened</p>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default ChartSection;



















// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { Minimize, Maximize } from "lucide-react";
// import * as LightweightCharts from "lightweight-charts";
// import axios from "axios";
// import { ably } from "../../utils/ablyClient";
// import LineAreaChart from "./LineAreaChart";

// const URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

// interface ChartButtonProps {
//   icon: React.ReactNode;
//   onClick: () => void;
// }

// const ChartButton: React.FC<ChartButtonProps> = ({ icon, onClick }) => (
//   <button
//     onClick={onClick}
//     className="p-2 text-gray-400 hover:text-white transition-colors"
//   >
//     {icon}
//   </button>
// );

// interface TokenData {
//   change24h: string;
//   bondingCurve?: string;
// }

// interface CandlestickData {
//   time: LightweightCharts.Time;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface OHLCData {
//   timestamp: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface ChartSectionProps {
//   tokenData: TokenData;
// }

// const chartProperties = {
//   timeScale: {
//     timeVisible: true,
//     secondsVisible: false,
//     fitContent: false,
//     rightOffset: 10,
//   },
//   crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
//   layout: { backgroundColor: "#000000", textColor: "#ffffff" },
//   grid: { horzLines: { color: "#2e2e2e" }, vertLines: { color: "#2e2e2e" } },
//   rightPriceScale: {
//     borderColor: "#2e2e2e",
//     autoScale: true,
//     scaleMargins: { top: 0.2, bottom: 0.2 },
//     priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//     alignLabels: true,
//     entireTextOnly: true,
//   },
// };

// // Extracted Candlestick chart logic into a component
// const CandlestickChart: React.FC<{
//   chartData: CandlestickData[];
//   chartContainerRef: React.RefObject<HTMLDivElement>;
//   isFullScreen: boolean;
//   setOhlcValues: React.Dispatch<
//     React.SetStateAction<{
//       open: string;
//       high: string;
//       low: string;
//       close: string;
//     }>
//   >;
//   setHoveredPrice: React.Dispatch<React.SetStateAction<string | null>>;
// }> = ({ chartData, chartContainerRef, isFullScreen, setOhlcValues, setHoveredPrice }) => {
//   const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
//   const candleSeriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);

//   useEffect(() => {
//     if (!chartContainerRef.current || chartData.length === 0) return;

//     if (!chartInstanceRef.current) {
//       const chart = LightweightCharts.createChart(chartContainerRef.current, {
//         ...chartProperties,
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//       });
//       chartInstanceRef.current = chart;

//       const candleSeries = chart.addCandlestickSeries({
//         upColor: "#4bff5c",
//         downColor: "#ff4b4b",
//         borderUpColor: "#4bff5c",
//         borderDownColor: "#ff4b4b",
//         wickUpColor: "#4bff5c",
//         wickDownColor: "#ff4b4b",
//         priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       });
//       candleSeriesRef.current = candleSeries;
//     }

//     if (candleSeriesRef.current) {
//       candleSeriesRef.current.setData(chartData);
//       const lastCandle = chartData[chartData.length - 1];
//       setOhlcValues({
//         open: lastCandle.open.toFixed(10),
//         high: lastCandle.high.toFixed(10),
//         low: lastCandle.low.toFixed(10),
//         close: lastCandle.close.toFixed(10),
//       });
//     }

//     const chart = chartInstanceRef.current!;
//     chart.subscribeCrosshairMove((param) => {
//       if (!param.time || !candleSeriesRef.current) {
//         const lastCandle = chartData[chartData.length - 1];
//         setOhlcValues({
//           open: lastCandle.open.toFixed(10),
//           high: lastCandle.high.toFixed(10),
//           low: lastCandle.low.toFixed(10),
//           close: lastCandle.close.toFixed(10),
//         });
//         setHoveredPrice(null);
//         return;
//       }

//       const price = candleSeriesRef.current.coordinateToPrice(param.point!.y);
//       if (price) setHoveredPrice(price.toFixed(10));

//       const candleData = chartData.find((candle) => candle.time === param.time);
//       if (candleData) {
//         setOhlcValues({
//           open: candleData.open.toFixed(10),
//           high: candleData.high.toFixed(10),
//           low: candleData.low.toFixed(10),
//           close: candleData.close.toFixed(10),
//         });
//       }
//     });

//     chart.timeScale().applyOptions({ rightOffset: 10, barSpacing: 10 });
//     chart.priceScale("right").applyOptions({
//       autoScale: true,
//       scaleMargins: { top: 0.2, bottom: 0.2 },
//     });
//     chart.timeScale().fitContent();

//     const handleResize = () => {
//       if (chartInstanceRef.current && chartContainerRef.current) {
//         const availableHeight = isFullScreen
//           ? window.innerHeight - (chartContainerRef.current.offsetTop || 0)
//           : chartContainerRef.current.clientHeight;
//         const availableWidth = isFullScreen
//           ? window.innerWidth
//           : chartContainerRef.current.clientWidth;
//         chartInstanceRef.current.applyOptions({
//           width: availableWidth,
//           height: availableHeight,
//         });
//         chartInstanceRef.current.timeScale().fitContent();
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.unsubscribeCrosshairMove(() => {});
//         chartInstanceRef.current.remove();
//         chartInstanceRef.current = null;
//         candleSeriesRef.current = null;
//       }
//     };
//   }, [chartData, isFullScreen, setOhlcValues, setHoveredPrice]);

//   return null; // The chart is rendered in chartContainerRef
// };

// const ChartSection: React.FC<ChartSectionProps> = ({ tokenData }) => {
//   const [ohlcValues, setOhlcValues] = useState({
//     open: "0",
//     high: "0",
//     low: "0",
//     close: "0",
//   });
//   const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [chartData, setChartData] = useState<CandlestickData[]>([]);
//   const [selectedInterval, setSelectedInterval] = useState<"5min" | "hour">("hour");
//   const [selectedRange, setSelectedRange] = useState<"24h" | "3d" | "7d" | "30d">("24h");
//   const [chartType, setChartType] = useState<"candlestick" | "area">("candlestick");
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);

//   const convertScientificToDecimal = (value: number): number =>
//     parseFloat(value.toFixed(16));

//   const calculateStartTime = (range: "24h" | "3d" | "7d" | "30d") => {
//     const now = new Date();
//     switch (range) {
//       case "24h":
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//       case "3d":
//         return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
//       case "7d":
//         return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       case "30d":
//         return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
//       default:
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//     }
//   };

//   const fetchOHLCData = async (
//     interval: "5min" | "hour",
//     range: "24h" | "3d" | "7d" | "30d"
//   ): Promise<CandlestickData[]> => {
//     if (!tokenData.bondingCurve) {
//       console.log("No bondingCurve provided in tokenData");
//       return [];
//     }
//     try {
//       const startTime = calculateStartTime(range);
//       const response = await axios.get(`${URL}coin/api/price/ohlc`, {
//         params: {
//           interval,
//           startTime,
//           bondingCurve: tokenData.bondingCurve,
//         },
//       });
//       if (!Array.isArray(response.data) || response.data.length === 0) {
//         console.log(`No ${interval} OHLC data returned from API for ${range}`);
//         return [];
//       }
//       const mappedData = response.data.map((item: OHLCData) => ({
//         time: Math.floor(new Date(item.timestamp).getTime() / 1000) as LightweightCharts.Time,
//         open: convertScientificToDecimal(item.open),
//         high: convertScientificToDecimal(item.high),
//         low: convertScientificToDecimal(item.low),
//         close: convertScientificToDecimal(item.close),
//       }));
//       return mappedData;
//     } catch (error) {
//       console.error(`Error fetching ${interval} OHLC data for ${range}:`, error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     if (!tokenData.bondingCurve) {
//       console.log("Skipping fetch: No bondingCurve");
//       return;
//     }

//     fetchOHLCData(selectedInterval, selectedRange).then((data) => {
//       setChartData(data);
//     });

//     const channel = ably.channels.get("coins");

//     const onPriceUpdate = (message: any) => {
//       const data = message.data as {
//         bondingCurve: string;
//         price: number;
//         timestamp: string;
//       };
//       console.log("Received Ably priceUpdate message:", message);

//       if (data.bondingCurve === tokenData.bondingCurve) {
//         const newCandle: CandlestickData = {
//           time: Math.floor(new Date(data.timestamp).getTime() / 1000) as LightweightCharts.Time,
//           open: data.price,
//           high: data.price,
//           low: data.price,
//           close: data.price,
//         };

//         setChartData((prevData) => {
//           const lastCandle = prevData[prevData.length - 1];
//           if (lastCandle && lastCandle.time === newCandle.time) {
//             const updatedCandle = {
//               ...lastCandle,
//               high: Math.max(lastCandle.high, newCandle.close),
//               low: Math.min(lastCandle.low, newCandle.close),
//               close: newCandle.close,
//             };
//             return [...prevData.slice(0, -1), updatedCandle];
//           } else {
//             return [...prevData, newCandle];
//           }
//         });
//       }
//     };

//     channel.subscribe("priceUpdate", onPriceUpdate);

//     return () => {
//       channel.unsubscribe("priceUpdate", onPriceUpdate);
//     };
//   }, [tokenData.bondingCurve, selectedInterval, selectedRange]);

//   const toggleFullScreen = () => {
//     if (!chartRef.current) return;
//     if (!document.fullscreenElement) {
//       chartRef.current.requestFullscreen({ navigationUI: "auto" }).then(() => {
//         setIsFullScreen(true);
//         if (chartContainerRef.current && headerRef.current) {
//           const headerHeight = headerRef.current.clientHeight || 0;
//           chartContainerRef.current.style.width = "100vw";
//           chartContainerRef.current.style.height = `${window.innerHeight - headerHeight}px`;
//         }
//       });
//     } else {
//       document.exitFullscreen().then(() => {
//         setIsFullScreen(false);
//         if (chartContainerRef.current) {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       const isNowFullScreen = !!document.fullscreenElement;
//       setIsFullScreen(isNowFullScreen);
//       if (chartContainerRef.current && headerRef.current) {
//         const headerHeight = headerRef.current.clientHeight || 0;
//         if (isNowFullScreen) {
//           chartContainerRef.current.style.width = "100vw";
//           chartContainerRef.current.style.height = `${window.innerHeight - headerHeight}px`;
//         } else {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//         }
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.1 }}
//       className={`bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5 ${
//         isFullScreen ? "fixed inset-0 z-50 m-0 p-0 h-screen w-screen flex flex-col" : ""
//       }`}
//       ref={chartRef}
//     >
//       <div ref={headerRef} className={`flex flex-col mb-4 gap-3 ${isFullScreen ? "px-4 pt-4" : ""}`}>
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-4 flex-wrap">
//             {/* View Dropdown */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">View:</span>
//               <select
//                 value={selectedInterval}
//                 onChange={(e) => setSelectedInterval(e.target.value as "5min" | "hour")}
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="5min">5m</option>
//                 <option value="hour">1h</option>
//               </select>
//             </div>
//             {/* Change Dropdown */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">Change:</span>
//               <select
//                 value={selectedRange}
//                 onChange={(e) => setSelectedRange(e.target.value as "24h" | "3d" | "7d" | "30d")}
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="24h">24h</option>
//                 <option value="3d">3d</option>
//                 <option value="7d">7d</option>
//                 <option value="30d">30d</option>
//               </select>
//             </div>
//             {/* Chart Type Toggle */}
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">Chart:</span>
//               <button
//                 onClick={() => setChartType(chartType === "candlestick" ? "area" : "candlestick")}
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 {chartType === "candlestick" ? "Switch to Area" : "Switch to Candlestick"}
//               </button>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-gray-800/50">
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">O:</span>
//                 <span className="text-green-400 font-mono text-xs">{ohlcValues.open}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">H:</span>
//                 <span className="text-white font-mono text-xs">{ohlcValues.high}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">L:</span>
//                 <span className="text-white font-mono text-xs">{ohlcValues.low}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">C:</span>
//                 <span className="text-white font-mono text-xs">{ohlcValues.close}</span>
//               </div>
//             </div>
//             <ChartButton
//               icon={isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
//               onClick={toggleFullScreen}
//             />
//           </div>
//         </div>
//       </div>
//       <div
//         className={`relative flex-1 bg-black/40 rounded-xl border border-gray-800 overflow-hidden ${
//           isFullScreen ? "h-auto" : "h-72 md:h-96"
//         }`}
//       >
//         {chartData.length > 0 ? (
//           <>
//             {hoveredPrice && (
//               <div
//                 className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-md text-sm"
//                 style={{ pointerEvents: "none" }}
//               >
//                 {hoveredPrice}
//               </div>
//             )}
//             <div
//               ref={chartContainerRef}
//               style={{ width: "100%", height: "100%", cursor: "crosshair" }}
//             />
//             {chartType === "candlestick" ? (
//               <CandlestickChart
//                 chartData={chartData}
//                 chartContainerRef={chartContainerRef}
//                 isFullScreen={isFullScreen}
//                 setOhlcValues={setOhlcValues}
//                 setHoveredPrice={setHoveredPrice}
//               />
//             ) : (
//               <LineAreaChart
//                 chartData={chartData}
//                 chartContainerRef={chartContainerRef}
//                 isFullScreen={isFullScreen}
//                 setOhlcValues={setOhlcValues}
//                 setHoveredPrice={setHoveredPrice}
//               />
//             )}
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <p className="text-sm">No trades have happened</p>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default ChartSection;





import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Minimize, Maximize } from "lucide-react";
import * as LightweightCharts from "lightweight-charts";
import axios from "axios";
import { ably } from "../../utils/ablyClient";
import LineAreaChart from "./LineAreaChart";

const URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

interface ChartButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
}

const ChartButton: React.FC<ChartButtonProps> = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 text-gray-400 hover:text-white transition-colors"
  >
    {icon}
  </button>
);

interface TokenData {
  change24h: string;
  bondingCurve?: string;
}

interface CandlestickData {
  time: LightweightCharts.Time;
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

interface ChartSectionProps {
  tokenData: TokenData;
}

const chartProperties = {
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    fitContent: false,
    rightOffset: 10,
  },
  crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
  layout: { backgroundColor: "#000000", textColor: "#ffffff" },
  grid: { horzLines: { color: "#2e2e2e" }, vertLines: { color: "#2e2e2e" } },
  rightPriceScale: {
    borderColor: "#2e2e2e",
    autoScale: true,
    scaleMargins: { top: 0.2, bottom: 0.2 },
    priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
    alignLabels: true,
    entireTextOnly: true,
  },
};

const CandlestickChart: React.FC<{
  chartData: CandlestickData[];
  chartContainerRef: React.RefObject<HTMLDivElement>;
  isFullScreen: boolean;
  setOhlcValues: React.Dispatch<
    React.SetStateAction<{
      open: string;
      high: string;
      low: string;
      close: string;
    }>
  >;
  setHoveredPrice: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ chartData, chartContainerRef, isFullScreen, setOhlcValues, setHoveredPrice }) => {
  const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
  const candleSeriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    if (!chartInstanceRef.current) {
      const chart = LightweightCharts.createChart(chartContainerRef.current, {
        ...chartProperties,
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
      chartInstanceRef.current = chart;

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#4bff5c",
        downColor: "#ff4b4b",
        borderUpColor: "#4bff5c",
        borderDownColor: "#ff4b4b",
        wickUpColor: "#4bff5c",
        wickDownColor: "#ff4b4b",
        priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
      });
      candleSeriesRef.current = candleSeries;
    }

    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData(chartData);
      const lastCandle = chartData[chartData.length - 1];
      setOhlcValues({
        open: lastCandle.open.toFixed(10),
        high: lastCandle.high.toFixed(10),
        low: lastCandle.low.toFixed(10),
        close: lastCandle.close.toFixed(10),
      });
    }

    const chart = chartInstanceRef.current!;
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !candleSeriesRef.current) {
        const lastCandle = chartData[chartData.length - 1];
        setOhlcValues({
          open: lastCandle.open.toFixed(10),
          high: lastCandle.high.toFixed(10),
          low: lastCandle.low.toFixed(10),
          close: lastCandle.close.toFixed(10),
        });
        setHoveredPrice(null);
        return;
      }

      const price = candleSeriesRef.current.coordinateToPrice(param.point!.y);
      if (price) setHoveredPrice(price.toFixed(10));

      const candleData = chartData.find((candle) => candle.time === param.time);
      if (candleData) {
        setOhlcValues({
          open: candleData.open.toFixed(10),
          high: candleData.high.toFixed(10),
          low: candleData.low.toFixed(10),
          close: candleData.close.toFixed(10),
        });
      }
    });

    chart.timeScale().applyOptions({ rightOffset: 10, barSpacing: 10 });
    chart.priceScale("right").applyOptions({
      autoScale: true,
      scaleMargins: { top: 0.2, bottom: 0.2 },
    });
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartInstanceRef.current && chartContainerRef.current) {
        const headerHeight = chartContainerRef.current.offsetTop || 0;
        const scaleOffset = isFullScreen ? 60 : 0; // Offset for price and time scales
        const availableHeight = isFullScreen
          ? window.innerHeight - headerHeight - scaleOffset
          : chartContainerRef.current.clientHeight;
        const availableWidth = isFullScreen
          ? window.innerWidth - scaleOffset
          : chartContainerRef.current.clientWidth;
        chartInstanceRef.current.applyOptions({
          width: availableWidth,
          height: availableHeight,
        });
        chartInstanceRef.current.timeScale().fitContent();
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.unsubscribeCrosshairMove(() => {});
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        candleSeriesRef.current = null;
      }
    };
  }, [chartData, isFullScreen, setOhlcValues, setHoveredPrice]);

  return null;
};

const ChartSection: React.FC<ChartSectionProps> = ({ tokenData }) => {
  const [ohlcValues, setOhlcValues] = useState({
    open: "0",
    high: "0",
    low: "0",
    close: "0",
  });
  const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<"5min" | "hour">("hour");
  const [selectedRange, setSelectedRange] = useState<"24h" | "3d" | "7d" | "30d">("24h");
  const [chartType, setChartType] = useState<"candlestick" | "area">("candlestick");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const convertScientificToDecimal = (value: number): number =>
    parseFloat(value.toFixed(16));

  const calculateStartTime = (range: "24h" | "3d" | "7d" | "30d") => {
    const now = new Date();
    switch (range) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case "3d":
        return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const fetchOHLCData = async (
    interval: "5min" | "hour",
    range: "24h" | "3d" | "7d" | "30d"
  ): Promise<CandlestickData[]> => {
    if (!tokenData.bondingCurve) {
      console.log("No bondingCurve provided in tokenData");
      return [];
    }
    try {
      const startTime = calculateStartTime(range);
      const response = await axios.get(`${URL}coin/api/price/ohlc`, {
        params: {
          interval,
          startTime,
          bondingCurve: tokenData.bondingCurve,
        },
      });
      if (!Array.isArray(response.data) || response.data.length === 0) {
        // console.log(`No ${interval} OHLC data returned from API for ${range}`);
        return [];
      }
      const mappedData = response.data.map((item: OHLCData) => ({
        time: Math.floor(new Date(item.timestamp).getTime() / 1000) as LightweightCharts.Time,
        open: convertScientificToDecimal(item.open),
        high: convertScientificToDecimal(item.high),
        low: convertScientificToDecimal(item.low),
        close: convertScientificToDecimal(item.close),
      }));
      return mappedData;
    } catch (error) {
      console.error(`Error fetching ${interval} OHLC data for ${range}:`, error);
      return [];
    }
  };

  useEffect(() => {
    if (!tokenData.bondingCurve) {
      console.log("Skipping fetch: No bondingCurve");
      return;
    }

    fetchOHLCData(selectedInterval, selectedRange).then((data) => {
      setChartData(data);
    });

    const channel = ably.channels.get("coins");

    const onPriceUpdate = (message: any) => {
      const data = message.data as {
        bondingCurve: string;
        price: number;
        timestamp: string;
      };
      // console.log("Received Ably priceUpdate message:", message);

      if (data.bondingCurve === tokenData.bondingCurve) {
        const newCandle: CandlestickData = {
          time: Math.floor(new Date(data.timestamp).getTime() / 1000) as LightweightCharts.Time,
          open: data.price,
          high: data.price,
          low: data.price,
          close: data.price,
        };

        setChartData((prevData) => {
          const lastCandle = prevData[prevData.length - 1];
          if (lastCandle && lastCandle.time === newCandle.time) {
            const updatedCandle = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newCandle.close),
              low: Math.min(lastCandle.low, newCandle.close),
              close: newCandle.close,
            };
            return [...prevData.slice(0, -1), updatedCandle];
          } else {
            return [...prevData, newCandle];
          }
        });
      }
    };

    channel.subscribe("priceUpdate", onPriceUpdate);

    return () => {
      channel.unsubscribe("priceUpdate", onPriceUpdate);
    };
  }, [tokenData.bondingCurve, selectedInterval, selectedRange]);

  const toggleFullScreen = () => {
    if (!chartRef.current) return;
    if (!document.fullscreenElement) {
      chartRef.current.requestFullscreen({ navigationUI: "auto" }).then(() => {
        setIsFullScreen(true);
        if (chartContainerRef.current && headerRef.current) {
          const headerHeight = headerRef.current.clientHeight || 0;
          const scaleOffset = 60; // Offset for price and time scales
          chartContainerRef.current.style.width = `${window.innerWidth - scaleOffset}px`;
          chartContainerRef.current.style.height = `${window.innerHeight - headerHeight - scaleOffset}px`;
          chartContainerRef.current.style.margin = "0 auto"; // Center the chart
        }
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
        if (chartContainerRef.current) {
          chartContainerRef.current.style.width = "100%";
          chartContainerRef.current.style.height = "100%";
          chartContainerRef.current.style.margin = "0";
        }
      });
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isNowFullScreen = !!document.fullscreenElement;
      setIsFullScreen(isNowFullScreen);
      if (chartContainerRef.current && headerRef.current) {
        const headerHeight = headerRef.current.clientHeight || 0;
        const scaleOffset = 60; // Offset for price and time scales
        if (isNowFullScreen) {
          chartContainerRef.current.style.width = `${window.innerWidth - scaleOffset}px`;
          chartContainerRef.current.style.height = `${window.innerHeight - headerHeight - scaleOffset}px`;
          chartContainerRef.current.style.margin = "0 auto";
        } else {
          chartContainerRef.current.style.width = "100%";
          chartContainerRef.current.style.height = "100%";
          chartContainerRef.current.style.margin = "0";
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5 ${
        isFullScreen ? "fixed inset-0 z-50 m-0 p-0 h-screen w-screen flex flex-col" : ""
      }`}
      ref={chartRef}
    >
      <div ref={headerRef} className={`flex flex-col mb-4 gap-3 ${isFullScreen ? "px-4 pt-4" : ""}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">View:</span>
              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value as "5min" | "hour")}
                className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                <option value="5min">5m</option>
                <option value="hour">1h</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Change:</span>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value as "24h" | "3d" | "7d" | "30d")}
                className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                <option value="24h">24h</option>
                <option value="3d">3d</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Chart:</span>
              <button
                onClick={() => setChartType(chartType === "candlestick" ? "area" : "candlestick")}
                className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                {chartType === "candlestick" ? "Switch to Area" : "Switch to Candlestick"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-gray-800/50">
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 text-xs">O:</span>
                <span className="text-green-400 font-mono text-xs">{ohlcValues.open}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 text-xs">H:</span>
                <span className="text-white font-mono text-xs">{ohlcValues.high}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 text-xs">L:</span>
                <span className="text-white font-mono text-xs">{ohlcValues.low}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 text-xs">C:</span>
                <span className="text-white font-mono text-xs">{ohlcValues.close}</span>
              </div>
            </div>
            <ChartButton
              icon={isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
              onClick={toggleFullScreen}
            />
          </div>
        </div>
      </div>
      <div
        className={`relative flex-1 bg-black/40 rounded-xl border border-gray-800 overflow-hidden ${
          isFullScreen ? "h-auto px-4 pb-4" : "h-72 md:h-96"
        }`}
      >
        {chartData.length > 0 ? (
          <>
            {hoveredPrice && (
              <div
                className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-md text-sm"
                style={{ pointerEvents: "none" }}
              >
                {hoveredPrice}
              </div>
            )}
            <div
              ref={chartContainerRef}
              style={{ width: "100%", height: "100%", cursor: "crosshair" }}
            />
            {chartType === "candlestick" ? (
              <CandlestickChart
                chartData={chartData}
                chartContainerRef={chartContainerRef}
                isFullScreen={isFullScreen}
                setOhlcValues={setOhlcValues}
                setHoveredPrice={setHoveredPrice}
              />
            ) : (
              <LineAreaChart
                chartData={chartData}
                chartContainerRef={chartContainerRef}
                isFullScreen={isFullScreen}
                setOhlcValues={setOhlcValues}
                setHoveredPrice={setHoveredPrice}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">No trades have happened</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChartSection;







// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { Minimize, Maximize } from "lucide-react";
// import * as LightweightCharts from "lightweight-charts";
// import axios from "axios";
// import { ably } from "../../utils/ablyClient";
// import LineAreaChart from "./LineAreaChart";

// const URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

// interface ChartButtonProps {
//   icon: React.ReactNode;
//   onClick: () => void;
// }

// const ChartButton: React.FC<ChartButtonProps> = ({ icon, onClick }) => (
//   <button
//     onClick={onClick}
//     className="p-2 text-gray-400 hover:text-white transition-colors"
//   >
//     {icon}
//   </button>
// );

// interface TokenData {
//   change24h: string;
//   bondingCurve?: string;
// }

// interface CandlestickData {
//   time: LightweightCharts.Time;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface OHLCData {
//   timestamp: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface ChartSectionProps {
//   tokenData: TokenData;
// }

// const chartProperties = {
//   timeScale: {
//     timeVisible: true,
//     secondsVisible: false,
//     fitContent: false,
//     rightOffset: 10,
//   },
//   crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
//   layout: { backgroundColor: "#000000", textColor: "#ffffff" },
//   grid: { horzLines: { color: "#2e2e2e" }, vertLines: { color: "#2e2e2e" } },
//   rightPriceScale: {
//     borderColor: "#2e2e2e",
//     autoScale: true,
//     scaleMargins: { top: 0.2, bottom: 0.2 },
//     priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//     alignLabels: true,
//     entireTextOnly: true,
//   },
// };

// const CandlestickChart: React.FC<{
//   chartData: CandlestickData[];
//   chartContainerRef: React.RefObject<HTMLDivElement>;
//   isFullScreen: boolean;
//   setOhlcValues: React.Dispatch<
//     React.SetStateAction<{
//       open: string;
//       high: string;
//       low: string;
//       close: string;
//     }>
//   >;
//   setHoveredPrice: React.Dispatch<React.SetStateAction<string | null>>;
// }> = ({ chartData, chartContainerRef, isFullScreen, setOhlcValues, setHoveredPrice }) => {
//   const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
//   const candleSeriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick"> | null>(null);

//   useEffect(() => {
//     if (!chartContainerRef.current || chartData.length === 0) return;

//     if (!chartInstanceRef.current) {
//       const chart = LightweightCharts.createChart(chartContainerRef.current, {
//         ...chartProperties,
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//       });
//       chartInstanceRef.current = chart;

//       const candleSeries = chart.addCandlestickSeries({
//         upColor: "#4bff5c",
//         downColor: "#ff4b4b",
//         borderUpColor: "#4bff5c",
//         borderDownColor: "#ff4b4b",
//         wickUpColor: "#4bff5c",
//         wickDownColor: "#ff4b4b",
//         priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       });
//       candleSeriesRef.current = candleSeries;
//     }

//     if (candleSeriesRef.current) {
//       candleSeriesRef.current.setData(chartData);
//       const lastCandle = chartData[chartData.length - 1];
//       setOhlcValues({
//         open: lastCandle.open.toFixed(10),
//         high: lastCandle.high.toFixed(10),
//         low: lastCandle.low.toFixed(10),
//         close: lastCandle.close.toFixed(10),
//       });
//     }

//     const chart = chartInstanceRef.current!;
//     chart.subscribeCrosshairMove((param) => {
//       if (!param.time || !candleSeriesRef.current) {
//         const lastCandle = chartData[chartData.length - 1];
//         setOhlcValues({
//           open: lastCandle.open.toFixed(10),
//           high: lastCandle.high.toFixed(10),
//           low: lastCandle.low.toFixed(10),
//           close: lastCandle.close.toFixed(10),
//         });
//         setHoveredPrice(null);
//         return;
//       }

//       const price = candleSeriesRef.current.coordinateToPrice(param.point!.y);
//       if (price) setHoveredPrice(price.toFixed(10));

//       const candleData = chartData.find((candle) => candle.time === param.time);
//       if (candleData) {
//         setOhlcValues({
//           open: candleData.open.toFixed(10),
//           high: candleData.high.toFixed(10),
//           low: candleData.low.toFixed(10),
//           close: candleData.close.toFixed(10),
//         });
//       }
//     });

//     chart.timeScale().applyOptions({ rightOffset: 10, barSpacing: 10 });
//     chart.priceScale("right").applyOptions({
//       autoScale: true,
//       scaleMargins: { top: 0.2, bottom: 0.2 },
//     });
//     chart.timeScale().fitContent();

//     const handleResize = () => {
//       if (chartInstanceRef.current && chartContainerRef.current) {
//         const headerHeight = chartContainerRef.current.offsetTop || 0;
//         const scaleOffset = isFullScreen ? 60 : 0;
//         const availableHeight = isFullScreen
//           ? window.innerHeight - headerHeight - scaleOffset
//           : chartContainerRef.current.clientHeight;
//         const availableWidth = isFullScreen
//           ? window.innerWidth - scaleOffset
//           : chartContainerRef.current.clientWidth;
//         chartInstanceRef.current.applyOptions({
//           width: availableWidth,
//           height: availableHeight,
//         });
//         chartInstanceRef.current.timeScale().fitContent();
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.unsubscribeCrosshairMove(() => {});
//         chartInstanceRef.current.remove();
//         chartInstanceRef.current = null;
//         candleSeriesRef.current = null;
//       }
//     };
//   }, [chartData, isFullScreen, setOhlcValues, setHoveredPrice]);

//   return null;
// };

// const ChartSection: React.FC<ChartSectionProps> = ({ tokenData }) => {
//   const [ohlcValues, setOhlcValues] = useState({
//     open: "0",
//     high: "0",
//     low: "0",
//     close: "0",
//   });
//   const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [chartData, setChartData] = useState<CandlestickData[]>([]);
//   const [selectedInterval, setSelectedInterval] = useState<"5min" | "hour">("hour");
//   const [selectedRange, setSelectedRange] = useState<"24h" | "3d" | "7d" | "30d">("24h");
//   const [chartType, setChartType] = useState<"candlestick" | "area">("candlestick");
//   const [hasUserChangedRange, setHasUserChangedRange] = useState(false);
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);

//   const convertScientificToDecimal = (value: number): number =>
//     parseFloat(value.toFixed(16));

//   const calculateStartTime = (range: "24h" | "3d" | "7d" | "30d") => {
//     const now = new Date();
//     switch (range) {
//       case "24h":
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//       case "3d":
//         return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
//       case "7d":
//         return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       case "30d":
//         return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
//       default:
//         return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
//     }
//   };

//   const fetchOHLCData = async (
//     interval: "5min" | "hour",
//     range: "24h" | "3d" | "7d" | "30d"
//   ): Promise<CandlestickData[]> => {
//     if (!tokenData.bondingCurve) {
//       console.log("No bondingCurve provided in tokenData");
//       return [];
//     }
//     try {
//       const startTime = calculateStartTime(range);
//       const response = await axios.get(`${URL}coin/api/price/ohlc`, {
//         params: {
//           interval,
//           startTime,
//           bondingCurve: tokenData.bondingCurve,
//         },
//       });
//       if (!Array.isArray(response.data) || response.data.length === 0) {
//         console.log(`No ${interval} OHLC data returned from API for ${range}`);
//         return [];
//       }
//       const mappedData = response.data.map((item: OHLCData) => ({
//         time: Math.floor(new Date(item.timestamp).getTime() / 1000) as LightweightCharts.Time,
//         open: convertScientificToDecimal(item.open),
//         high: convertScientificToDecimal(item.high),
//         low: convertScientificToDecimal(item.low),
//         close: convertScientificToDecimal(item.close),
//       }));
//       return mappedData;
//     } catch (error) {
//       console.error(`Error fetching ${interval} OHLC data for ${range}:`, error);
//       return [];
//     }
//   };

//   const tryFetchDataForRanges = async () => {
//     if (hasUserChangedRange) return;

//     const ranges: ("24h" | "3d" | "7d" | "30d")[] = ["24h", "3d", "7d", "30d"];
//     for (const range of ranges) {
//       const data = await fetchOHLCData(selectedInterval, range);
//       if (data.length > 0) {
//         setSelectedRange(range);
//         setChartData(data);
//         return;
//       }
//     }
//     setChartData([]);
//   };

//   useEffect(() => {
//     if (!tokenData.bondingCurve) {
//       console.log("Skipping fetch: No bondingCurve");
//       return;
//     }

//     if (!hasUserChangedRange) {
//       tryFetchDataForRanges();
//     } else {
//       fetchOHLCData(selectedInterval, selectedRange).then((data) => {
//         setChartData(data);
//       });
//     }

//     const channel = ably.channels.get("coins");

//     const onPriceUpdate = (message: any) => {
//       const data = message.data as {
//         bondingCurve: string;
//         price: number;
//         timestamp: string;
//       };
//       console.log("Received Ably priceUpdate message:", message);

//       if (data.bondingCurve === tokenData.bondingCurve) {
//         const newCandle: CandlestickData = {
//           time: Math.floor(new Date(data.timestamp).getTime() / 1000) as LightweightCharts.Time,
//           open: data.price,
//           high: data.price,
//           low: data.price,
//           close: data.price,
//         };

//         setChartData((prevData) => {
//           const lastCandle = prevData[prevData.length - 1];
//           if (lastCandle && lastCandle.time === newCandle.time) {
//             const updatedCandle = {
//               ...lastCandle,
//               high: Math.max(lastCandle.high, newCandle.close),
//               low: Math.min(lastCandle.low, newCandle.close),
//               close: newCandle.close,
//             };
//             return [...prevData.slice(0, -1), updatedCandle];
//           } else {
//             return [...prevData, newCandle];
//           }
//         });
//       }
//     };

//     channel.subscribe("priceUpdate", onPriceUpdate);

//     return () => {
//       channel.unsubscribe("priceUpdate", onPriceUpdate);
//     };
//   }, [tokenData.bondingCurve, selectedInterval, selectedRange, hasUserChangedRange]);

//   const handleRangeChange = (range: "24h" | "3d" | "7d" | "30d") => {
//     setSelectedRange(range);
//     setHasUserChangedRange(true);
//   };

//   const toggleFullScreen = () => {
//     if (!chartRef.current) return;
//     if (!document.fullscreenElement) {
//       chartRef.current.requestFullscreen({ navigationUI: "auto" }).then(() => {
//         setIsFullScreen(true);
//         if (chartContainerRef.current && headerRef.current) {
//           const headerHeight = headerRef.current.clientHeight || 0;
//           const scaleOffset = 60;
//           chartContainerRef.current.style.width = `${window.innerWidth - scaleOffset}px`;
//           chartContainerRef.current.style.height = `${window.innerHeight - headerHeight - scaleOffset}px`;
//           chartContainerRef.current.style.margin = "0 auto";
//         }
//       });
//     } else {
//       document.exitFullscreen().then(() => {
//         setIsFullScreen(false);
//         if (chartContainerRef.current) {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//           chartContainerRef.current.style.margin = "0";
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       const isNowFullScreen = !!document.fullscreenElement;
//       setIsFullScreen(isNowFullScreen);
//       if (chartContainerRef.current && headerRef.current) {
//         const headerHeight = headerRef.current.clientHeight || 0;
//         const scaleOffset = 60;
//         if (isNowFullScreen) {
//           chartContainerRef.current.style.width = `${window.innerWidth - scaleOffset}px`;
//           chartContainerRef.current.style.height = `${window.innerHeight - headerHeight - scaleOffset}px`;
//           chartContainerRef.current.style.margin = "0 auto";
//         } else {
//           chartContainerRef.current.style.width = "100%";
//           chartContainerRef.current.style.height = "100%";
//           chartContainerRef.current.style.margin = "0";
//         }
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.1 }}
//       className={`bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 shadow-lg shadow-purple-500/5 ${
//         isFullScreen ? "fixed inset-0 z-50 m-0 p-0 h-screen w-screen flex flex-col" : ""
//       }`}
//       ref={chartRef}
//     >
//       <div ref={headerRef} className={`flex flex-col mb-4 gap-3 ${isFullScreen ? "px-4 pt-4" : ""}`}>
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-4 flex-wrap">
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">View:</span>
//               <select
//                 value={selectedInterval}
//                 onChange={(e) => setSelectedInterval(e.target.value as "5min" | "hour")}
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="5min">5m</option>
//                 <option value="hour">1h</option>
//               </select>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">Change:</span>
//               <select
//                 value={selectedRange}
//                 onChange={(e) => handleRangeChange(e.target.value as "24h" | "3d" | "7d" | "30d")}
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 <option value="24h">24h</option>
//                 <option value="3d">3d</option>
//                 <option value="7d">7d</option>
//                 <option value="30d">30d</option>
//               </select>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400 text-xs">Chart:</span>
//               <button
//                 onClick={() => setChartType(chartType === "candlestick" ? "area" : "candlestick")}
//                 className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
//               >
//                 {chartType === "candlestick" ? "Switch to Area" : "Switch to Candlestick"}
//               </button>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-gray-800/50">
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">O:</span>
//                 <span className="text-green-400 font-mono text-xs">{ohlcValues.open}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">H:</span>
//                 <span className="text-white font-mono text-xs">{ohlcValues.high}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">L:</span>
//                 <span className="text-white font-mono text-xs">{ohlcValues.low}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <span className="text-gray-500 text-xs">C:</span>
//                 <span className="text-white font-mono text-xs">{ohlcValues.close}</span>
//               </div>
//             </div>
//             <ChartButton
//               icon={isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
//               onClick={toggleFullScreen}
//             />
//           </div>
//         </div>
//       </div>
//       <div
//         className={`relative flex-1 bg-black/40 rounded-xl border border-gray-800 overflow-hidden ${
//           isFullScreen ? "h-auto px-4 pb-4" : "h-72 md:h-96"
//         }`}
//       >
//         {chartData.length > 0 ? (
//           <>
//             {hoveredPrice && (
//               <div
//                 className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-md text-sm"
//                 style={{ pointerEvents: "none" }}
//               >
//                 {hoveredPrice}
//               </div>
//             )}
//             <div
//               ref={chartContainerRef}
//               style={{ width: "100%", height: "100%", cursor: "crosshair" }}
//             />
//             {chartType === "candlestick" ? (
//               <CandlestickChart
//                 chartData={chartData}
//                 chartContainerRef={chartContainerRef}
//                 isFullScreen={isFullScreen}
//                 setOhlcValues={setOhlcValues}
//                 setHoveredPrice={setHoveredPrice}
//               />
//             ) : (
//               <LineAreaChart
//                 chartData={chartData}
//                 chartContainerRef={chartContainerRef}
//                 isFullScreen={isFullScreen}
//                 setOhlcValues={setOhlcValues}
//                 setHoveredPrice={setHoveredPrice}
//               />
//             )}
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <p className="text-sm">No trades have happened</p>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default ChartSection;