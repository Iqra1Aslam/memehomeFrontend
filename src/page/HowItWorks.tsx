"use client";

import type React from "react";
import { Rocket, Coins, TrendingUp, Video } from "lucide-react";
import Create from "../assests/creation page.png";
import Trade from "../assests/trade.png";
import video from "../assests/memevideo.mp4";
import { useNavigate } from "react-router-dom";

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-20 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            How MemeHome Works
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create, trade, and grow your meme coins on Solana with our
            easy-to-use platform
          </p>
        </div>

        <div className="space-y-24">
          {/* Create Meme Coin Section */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-4 px-5 py-2 bg-purple-900/30 rounded-full">
                <Rocket className="w-6 h-6 text-purple-400" />
                <span className="font-medium text-purple-300">Step 1</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Your Meme Coin
              </h2>

              <p className="text-lg text-gray-300 leading-relaxed">
                Launch your own meme coin in minutes! Connect your Solana
                wallet, customize your coin's name, symbol, description and
                image. Our intuitive interface makes it easy for anyone to
                create a meme coin without coding knowledge.
              </p>

              <ul className="space-y-3">
                {[
                  "Customize token details",
                  "Upload your meme image",
                  "Launch with a single click",
                  "Cost only ~ 0.02 SOL to launch",
                  "fee only ~ 0.0015% SOL per trade",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-gray-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-1/2 group">
              <div className="relative rounded-xl overflow-hidden shadow-[0_0_25px_rgba(139,92,246,0.3)] border border-purple-500/20 transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] group-hover:border-purple-500/50">
                <img
                  src={Create || "/placeholder.svg"}
                  alt="Create token interface"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Trade Meme Coin Section */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-4 px-5 py-2 bg-pink-900/30 rounded-full">
                <Coins className="w-6 h-6 text-pink-400" />
                <span className="font-medium text-pink-300">Step 2</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Trade Meme Coins
              </h2>

              <p className="text-lg text-gray-300 leading-relaxed">
                Buy and sell meme coins using our bonding curve mechanism. As
                more people buy, the price increases progressively. Trade with
                SOL directly from your wallet and watch your meme coin take
                off!
              </p>

              <ul className="space-y-3">
                {[
                  "Real-time price updates",
                  "Instant transactions",
                  "Transparent bonding curve",
                  "Secure wallet integration",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-gray-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-1/2 group">
              <div className="relative rounded-xl overflow-hidden shadow-[0_0_25px_rgba(236,72,153,0.3)] border border-pink-500/20 transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] group-hover:border-pink-500/50">
                <img
                  src={Trade || "/placeholder.svg"}
                  alt="Trading interface"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Video Tutorial Section */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 px-5 py-2 bg-indigo-900/30 rounded-full mb-6 mx-auto">
              <Video className="w-6 h-6 text-indigo-400" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Video Tutorial
            </h2>

            <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_35px_rgba(99,102,241,0.4)] border border-indigo-500/20 group transition-all duration-300 hover:shadow-[0_0_45px_rgba(99,102,241,0.6)] hover:border-indigo-500/50">
              <video
                src={video}
                controls
                poster="/placeholder.svg?height=540&width=960"
                className="w-full h-auto"
                preload="metadata"
              ></video>
            </div>

            <p className="mt-6 text-gray-300 max-w-2xl mx-auto">
              Watch our step-by-step tutorial to learn how to create, trade,
              and manage your meme coins on MemeHome
            </p>
          </div>

          {/* Raydium Listing Section */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-4 px-5 py-2 bg-blue-900/30 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <span className="font-medium text-blue-300">Step 3</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Raydium Listing
              </h2>

              <p className="text-lg text-gray-300 leading-relaxed">
                Once your meme coin completes its bonding curve, it
                automatically gets listed on Raydium, Solana's leading DEX.
                Reach a wider audience and let your meme coin soar in the open
                market!
              </p>

              <ul className="space-y-3">
                {[
                  "Automatic listing process",
                  "Liquidity pool creation",
                  "Exposure to Raydium traders",
                  "Continued trading potential",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-gray-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-1/2 group">
              <div className="relative rounded-xl overflow-hidden shadow-[0_0_25px_rgba(96,165,250,0.3)] border border-blue-500/20 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-6 transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(96,165,250,0.5)] group-hover:border-blue-500/50">
                <div className="flex flex-col items-center justify-center h-64 md:h-80">
                  <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Raydium DEX
                  </h3>
                  <p className="text-blue-200 text-center">
                    Your meme coin automatically listed on Solana's premier DEX
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Ready to Launch Your Meme Coin?
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/50"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;