import React from "react";
import { X } from "lucide-react";

interface HeaderProps {
  onClose: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClose }) => (
  <div className="text-center mb-8 pt-2">
    <button
      onClick={onClose}
      className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
    >
      <X size={24} />
    </button>
    <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500">
      Create Your Meme Token
    </h2>
    <p className="text-gray-400 mt-2 text-sm sm:text-base">
      Fill in the details below to launch your token
    </p>
  </div>
);

export default Header;
