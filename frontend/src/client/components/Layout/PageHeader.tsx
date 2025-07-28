import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-poppins font-semibold text-2xl lg:text-3xl xl:text-title text-secondary-2">
              {title}
            </h1>
            <p className="text-gray-600 font-open-sans text-base lg:text-lg mt-1">
              {subtitle}
            </p>
          </div>
       
        </div>
      </div>
    </div>
  );
};