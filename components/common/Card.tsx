import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`card bg-base-200 shadow-lg ${className}`} {...props}>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;