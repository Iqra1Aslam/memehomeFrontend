import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Filter } from "lucide-react"; // Import Filter icon

interface SortDropdownProps {
  onSortChange: (sortOption: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Filter"); // Default to "Filter"

  const options = [
    { label: "Creation Time", disabled: false },
    { label: "Market Cap", disabled: false },
    { label: "Last Trade", disabled: true }, // Disabled option
  ];

  const handleOptionClick = (option: string) => {
    if (option === "Last Trade") return; // Prevent action for disabled option
    setSelectedOption(option);
    setIsOpen(false);
    onSortChange(option);
  };

  return (
    <div className="relative">
      <motion.button
        // whileHover={{ scale: 1.05 }}
        // whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
      >
        {/* Show Filter icon if no option is selected */}
        {selectedOption === "Filter" ? (
          <>
            <Filter size={16} />
            <span>{selectedOption}</span>
          </>
        ) : (
          <span>{selectedOption}</span>
        )}
        <ChevronDown size={16} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute mt-2 w-48 rounded-lg bg-black/90 backdrop-blur-sm border border-purple-500/20 shadow-lg z-10"
        >
          {options.map((option) => (
            <div
              key={option.label}
              onClick={() =>
                !option.disabled && handleOptionClick(option.label)
              }
              className={`px-4 py-2 text-sm ${
                option.disabled
                  ? "text-gray-500 cursor-not-allowed" // Disabled style
                  : "text-white hover:bg-purple-500/20 cursor-pointer" // Enabled style
              } transition-colors`}
            >
              {option.label}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SortDropdown;
