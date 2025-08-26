import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'metric':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-6 h-32">
              <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        );
      
      case 'chart':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-6 h-80">
              <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-6">
              <div className="h-6 bg-gray-300 rounded w-32 mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded mb-3"></div>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-6 h-48">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;



