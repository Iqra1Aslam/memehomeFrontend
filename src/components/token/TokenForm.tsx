import React from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles } from "lucide-react";
import Input from "./Input";

interface TokenFormProps {
  formData: {
    name: string;
    symbol: string;
    image: string;
  
    description: string;
  };
  isImageUploading: boolean;
  isLoading: boolean;
  handleFormFieldChange: (
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const TokenForm: React.FC<TokenFormProps> = ({
  formData,
  isImageUploading,
  isLoading,
  handleFormFieldChange,
  handleImageChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Token Name"
            placeholder="e.g., PepeSol"
            value={formData.name}
            onChange={(e) => handleFormFieldChange("name", e)}
            required
          />
          <Input
            label="Token Symbol"
            placeholder="e.g., PEPE"
            value={formData.symbol}
            onChange={(e) => handleFormFieldChange("symbol", e)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base resize-none"
            rows={4}
            placeholder="Tell us about your token..."
            value={formData.description}
            onChange={(e) => handleFormFieldChange("description", e)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Image
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="token-image"
              required
            />
            <label
              htmlFor="token-image"
              className="w-full border-2 border-dashed border-purple-500/30 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors"
            >
              <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400 text-center">
                {formData.image
                  ? "Image Uploaded"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </label>
          </div>
        </div>
      </div>
      <span className="flex text-sm text-gray-400 ml-1">
       There is a 0.02% fee for creating a token.
        </span>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-purple-500/20 transition-shadow"
        type="submit"
        disabled={isImageUploading || isLoading}
      >
        
        <Sparkles className="w-5 h-5" />
        <span>
          {isImageUploading
            ? "Uploading Image..."
            : isLoading
            ? "Creating Token..."
            : "Create Token"}
        </span>
      </motion.button>
    </form>
  );
};

export default TokenForm;
