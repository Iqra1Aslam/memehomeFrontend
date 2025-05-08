import React, { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

interface SlideNotificationProps {
  title: string;
  message: string;
  transactionUrl: string;
  onClose: () => void;
  isOpen?: boolean;
  autoCloseTime?: number; // in milliseconds
}

const SlideNotification: React.FC<SlideNotificationProps> = ({
  title,
  message,
  transactionUrl,
  onClose,
  isOpen = true,
  autoCloseTime = 10000, // default 5 seconds
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100); // percentage

  useEffect(() => {
    if (isOpen) {
      // Abrupt animation - shorter delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVisible) {
      // Start the countdown timer
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / autoCloseTime) * 100);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          handleClose();
        }
      }, 50); // Update frequently for smooth animation

      return () => clearInterval(interval);
    }
  }, [isVisible, autoCloseTime]);

  const handleClose = () => {
    setIsVisible(false);
    // Delay the onClose callback to allow the exit animation to complete
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-5 left-0 z-50 transition-transform duration-200 ease-in-out ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div
        className="bg-black rounded-r-lg shadow-lg p-3 max-w-md"
        style={{
          borderLeft: "4px solid transparent",
          borderImage:
            "linear-gradient(to bottom, #8b5cf6, #ec4899, #6366f1) 1",
        }}
      >
        <div className="flex justify-between items-start">
          <div
            className="text-base font-semibold"
            style={{
              background:
                "linear-gradient(to right, #8b5cf6, #ec4899, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-xs text-gray-600 mt-1">{message}</div>

        {transactionUrl && (
          <a
            href={transactionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs mt-2 group"
            style={{
              color: "#8b5cf6",
            }}
          >
            <span className="underline">View transaction</span>
            <ExternalLink
              size={12}
              className="ml-1 group-hover:translate-x-0.5 transition-transform"
            />
          </a>
        )}

        {/* Timer progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${timeRemaining}%`,
              background:
                "linear-gradient(to right, #8b5cf6, #ec4899, #6366f1)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SlideNotification;
