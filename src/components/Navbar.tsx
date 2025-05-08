

import React, { useState, useEffect ,useRef} from "react";
import { motion } from "framer-motion";
import { Rocket, Lightbulb, Sparkles, Menu, X } from "lucide-react";
import {
  WalletMultiButton,
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../WalletModalStyles.css";
import NotificationBanner from "./trade-page/notification-banner";
import TokenCreationNotificationBanner from "./trade-page/TokenCreationNotificationBanner";

const URL = import.meta.env.VITE_API_URL;

interface NavbarProps {
  onLaunchClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLaunchClick }) => {
  const { connected, publicKey, signMessage } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showZeroBalancePopup, setShowZeroBalancePopup] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const hasSignedIn = useRef(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const checkWalletBalance = async () => {
    if (!publicKey) return;

    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;

      // console.log(`Wallet balance: ${balanceInSol} SOL`);

      if (balanceInSol === 0) {
        setShowZeroBalancePopup(true);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const connectWalletToBackend = async () => {
    if (!publicKey) {
      console.error("No public key available.");
      return;
    }

    const walletAddress = publicKey.toBase58();
    const name = walletAddress.slice(0, 6);

    try {
      const response = await fetch(`${URL}user/connect-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `@${name}`,
          wallet: walletAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // console.log("Wallet connected successfully:", data.user);
      } else {
        console.error("Wallet connection failed:", data.msg);
      }
    } catch (error) {
      console.error("Error connecting wallet to backend:", error);
    }
  };
  const Signin = async () => {
    if (!publicKey || !signMessage) return;
  
    try {
      const message = 'Memehome';
      const encodedMessage = new TextEncoder().encode(message);
  
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);
  
      // console.log('Wallet Address:', publicKey.toBase58());
      // console.log('Signature:', signatureBase58);
  
      setIsSignedIn(true); 
    } catch (err) {
      console.error('Signing failed:', err);
    }
  };
  
 
  useEffect(() => {
    if (connected && publicKey) {
      // Signin();
      connectWalletToBackend();
      checkWalletBalance();
    }
  }, [connected, publicKey]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full bg-black/10 backdrop-blur-lg z-50 px-4 py-2 border-b border-purple-500/20"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4 min-w-[600px]">
          <NotificationBanner
            tokenName="SAMPLE"
            marketCap="8.9k"
            tradeType="bought"
            amount="0.5 SOL"
          />
          <TokenCreationNotificationBanner />
        </div>

        <ul className="hidden md:flex items-end space-x-6 flex-grow justify-end mr-5">
          <li>
            <a
              href="https://working.memehome.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-300 transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500"
            >
              <span>How it works</span>
            </a>
          </li>
          <NavItem text="Launch" onClick={onLaunchClick} />
        </ul>

        <div className="hidden md:block">
          <WalletModalProvider>
            <WalletMultiButton
              className="wallet-multi-button"
              style={{
                background:
                  "linear-gradient(to right, #8b5cf6, #ec4899, #6366f1)",
                color: "white",
                fontWeight: 600,
                borderRadius: "9px",
                padding: "0.01rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                boxShadow:
                  "0 4px 6px -1px rgba(139, 92, 246, 0.2), 0 2px 4px -1px rgba(139, 92, 246, 0.12)",
                transition: "background 0.3s ease-in-out",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
              onClick={() => {
                if (connected && publicKey) {
                  Signin();  // Trigger the sign-in function when connected
                }
              }}
            >
              {connected ? (
                <span>{publicKey?.toBase58().slice(0, 6)}...</span>
              ) : (
                "Connect Wallet"
              )}
            </WalletMultiButton>
          </WalletModalProvider>
        </div>

        <div
         className="md:hidden flex items-center justify-end w-full"
         >
          <button
            onClick={toggleMobileMenu}
            className="text-purple-500 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-14 right-4 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg p-3"
          >
            <ul className="flex flex-col space-y-3">
              <li>
                <a
                  href="https://working.memehome.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-300 transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Lightbulb size={16} />
                  <span>How it works</span>
                </a>
              </li>
              <NavItem
                text="Launch"
                onClick={() => {
                  onLaunchClick();
                  setIsMobileMenuOpen(false);
                }}
              />
            </ul>
          </motion.div>
        )}

        {/* Zero Balance Popup */}
        {showZeroBalancePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1000] min-h-screen"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            role="dialog"
            aria-labelledby="zero-balance-title"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-[90%] sm:w-full border border-purple-500/20"
            >
              {/* Cross Icon for Close */}
              <button
                onClick={() => setShowZeroBalancePopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1 transition-colors"
                aria-label="Close popup"
              >
                <X size={20} />
              </button>

              {/* Popup Content */}
              <div className="text-center">
                <h2
                  id="zero-balance-title"
                  className="text-2xl font-bold text-white mb-3 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
                >
                  Zero Balance Detected
                </h2>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Your wallet currently has no SOL. Visit the Solana faucet to request testnet funds and start trading.
                </p>
                <a
                  href="https://faucet.solana.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Get Testnet SOL
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

const NavItem: React.FC<{
  text: string;
  onClick?: () => void;
}> = ({ text, onClick }) => (
  <li
    onClick={onClick}
    className="flex items-center space-x-1 cursor-pointer text-gray-300 transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500"
  >
    <span>{text}</span>
  </li>
);

export default Navbar;