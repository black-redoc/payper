'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', title, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${paddingClasses[padding]} ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-black mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}