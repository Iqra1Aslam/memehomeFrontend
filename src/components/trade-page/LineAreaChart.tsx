// import React, { useEffect, useRef } from "react";
// import * as LightweightCharts from "lightweight-charts";

// interface CandlestickData {
//   time: LightweightCharts.Time;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface LineAreaChartProps {
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

// const LineAreaChart: React.FC<LineAreaChartProps> = ({
//   chartData,
//   chartContainerRef,
//   isFullScreen,
//   setOhlcValues,
//   setHoveredPrice,
// }) => {
//   const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
//   const areaSeriesRef = useRef<LightweightCharts.ISeriesApi<"Area"> | null>(null);

//   useEffect(() => {
//     if (!chartContainerRef.current || chartData.length === 0) return;

//     if (!chartInstanceRef.current) {
//       const chart = LightweightCharts.createChart(chartContainerRef.current, {
//         ...chartProperties,
//         width: chartContainerRef.current.clientWidth,
//         height: chartContainerRef.current.clientHeight,
//       });
//       chartInstanceRef.current = chart;

//       const areaSeries = chart.addAreaSeries({
//         topColor: "rgba(185, 127, 243, 0.4)", // Semi-transparent #B97FF3
//         bottomColor: "rgba(185, 127, 243, 0.1)", // More transparent #B97FF3
//         lineColor: "#B97FF3", // Solid #B97FF3
//         lineWidth: 2,
//         priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
//       });
//       areaSeriesRef.current = areaSeries;
//     }

//     if (areaSeriesRef.current) {
//       const areaData = chartData.map((item) => ({
//         time: item.time,
//         value: item.close,
//       }));
//       areaSeriesRef.current.setData(areaData);

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
//       obrazu
//       if (!param.time || !areaSeriesRef.current) {
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

//       const price = param.seriesPrices.get(areaSeriesRef.current);
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
//         areaSeriesRef.current = null;
//       }
//     };
//   }, [chartData, isFullScreen, setOhlcValues, setHoveredPrice]);

//   return null;
// };

// export default LineAreaChart;



import React, { useEffect, useRef } from "react";
import * as LightweightCharts from "lightweight-charts";

interface CandlestickData {
  time: LightweightCharts.Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LineAreaChartProps {
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

const LineAreaChart: React.FC<LineAreaChartProps> = ({
  chartData,
  chartContainerRef,
  isFullScreen,
  setOhlcValues,
  setHoveredPrice,
}) => {
  const chartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
  const areaSeriesRef = useRef<LightweightCharts.ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    if (!chartInstanceRef.current) {
      const chart = LightweightCharts.createChart(chartContainerRef.current, {
        ...chartProperties,
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
      chartInstanceRef.current = chart;

      const areaSeries = chart.addAreaSeries({
        topColor: "rgba(185, 127, 243, 0.4)",
        bottomColor: "rgba(185, 127, 243, 0.1)",
        lineColor: "#B97FF3",
        lineWidth: 2,
        priceFormat: { type: "price", precision: 10, minMove: 0.0000000001 },
      });
      areaSeriesRef.current = areaSeries;
    }

    if (areaSeriesRef.current) {
      const areaData = chartData.map((item) => ({
        time: item.time,
        value: item.close,
      }));
      areaSeriesRef.current.setData(areaData);

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
      if (!param.time || !areaSeriesRef.current) {
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

      const price = param.seriesPrices.get(areaSeriesRef.current);
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
        areaSeriesRef.current = null;
      }
    };
  }, [chartData, isFullScreen, setOhlcValues, setHoveredPrice]);

  return null;
};

export default LineAreaChart;