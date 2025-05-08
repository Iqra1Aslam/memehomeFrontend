import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-black">
    <div className="text-center">
      <p className="mt-4 text-purple-400 text-lg font-semibold">
        Loading Homies...
      </p>
    </div>
  </div>
);

export default LoadingSpinner;
