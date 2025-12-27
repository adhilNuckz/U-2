import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-xl ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;