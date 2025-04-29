
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-blue"></div>
    </div>
  );
};

export default LoadingSpinner;
