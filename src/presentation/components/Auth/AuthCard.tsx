'use client';

import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
