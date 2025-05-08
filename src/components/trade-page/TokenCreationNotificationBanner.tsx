"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { channel } from "../../utils/ablyClient";
import axios from "axios";
const URL = import.meta.env.VITE_API_URL;
const jerkyAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    x: [0, -15, 15, -10, 10, -5, 5, 0],
    y: [0, -10, 10, -5, 5, -3, 3, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1],
      ease: "easeInOut",
    },
  },
  exit: { opacity: 0, y: -20 },
};

interface TokenCreation {
  id: number;
  message: string;
}

const TokenCreationNotificationBanner: React.FC = () => {
  const [lastTokenCreation, setLastTokenCreation] =
    useState<TokenCreation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notif, setNotif] = useState<Holder[]>([]);

  const saveLastTokenCreationToLocalStorage = (
    tokenCreation: TokenCreation
  ) => {
    localStorage.setItem("lastTokenCreation", JSON.stringify(tokenCreation));
  };

  const loadLastTokenCreationFromLocalStorage = (): TokenCreation | null => {
    const storedTokenCreation = localStorage.getItem("lastTokenCreation");
    if (storedTokenCreation) {
      try {
        return JSON.parse(storedTokenCreation) as TokenCreation;
      } catch (error) {
        console.error("Error parsing last token creation:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchTokenCreations = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${URL}coin/api/token-creation-notifications`
        );
        // console.log("API response:", response.data);

        // Handle the API response format { notification: "string" }
        const notificationMessage = response.data.notification;

        if (
          typeof notificationMessage === "string" &&
          notificationMessage.trim() !== ""
        ) {
          const newTokenCreation: TokenCreation = {
            id: Date.now(),
            message: notificationMessage,
          };

          setLastTokenCreation(newTokenCreation);
          saveLastTokenCreationToLocalStorage(newTokenCreation);
        } else {
          // If no valid notification, fall back to localStorage or default
          const storedTokenCreation = loadLastTokenCreationFromLocalStorage();
          setLastTokenCreation(
            storedTokenCreation || {
              id: Date.now(),
              message: "0xAbcde... created SampleToken",
            }
          );
        }
      } catch (error) {
        console.error("Error fetching token creations:", error);
        const storedTokenCreation = loadLastTokenCreationFromLocalStorage();
        setLastTokenCreation(
          storedTokenCreation || {
            id: Date.now(),
            message: "0xAbcde... created SampleToken",
          }
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenCreations();
  }, []);

  useEffect(() => {
    const handleNotif = (message: any) => {
      // console.log("Real-time koth progress update (Ably):", message.data);
      const { creator, ticker } = message.data;
      const notificationMessage = `${creator.name} created ${ticker}`;
      // console.log("Notification message:", notificationMessage);

      const newTokenCreation: TokenCreation = {
        id: Date.now(),
        message: notificationMessage,
      };

      setLastTokenCreation(newTokenCreation);
      saveLastTokenCreationToLocalStorage(newTokenCreation);
    };

    channel.subscribe("coinAdded", handleNotif);

    return () => {
      channel.unsubscribe("coinAdded", handleNotif);
    };
  }, []);

  if (isLoading || !lastTokenCreation) {
    return (
      <span className="text-xs text-gray-400 w-[400px] h-10 inline-flex items-center">
        Loading token notifications...
      </span>
    );
  }

  return (
    <motion.div
      key={lastTokenCreation.id}
      // variants={jerkyAnimation}
      // initial="initial"
      // animate="animate"
      exit="exit"
      className="max-w-[220px] w-full h-10 bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm text-white py-2 px-3 rounded-lg border border-green-500/40 shadow-lg shadow-green-500/10 flex-shrink-0 flex items-center"
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center space-x-1">
          {/* <Sparkles className="w-4 h-4 text-green-300" /> */}
          {/* <span className="font-semibold text-xs text-green-100">
            New Token:
          </span> */}
          <span className="text-xs text-green-200 truncate">
            {lastTokenCreation.message}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenCreationNotificationBanner;
