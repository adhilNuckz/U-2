import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-4 text-gray-300">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;