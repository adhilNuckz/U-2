import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`card-root ${className}`}>
      {title && (
        <h3 className="card-title">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;