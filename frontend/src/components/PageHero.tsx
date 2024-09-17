import React from 'react';

interface PageHeroProps {
  title: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ title }) => {
  return (
    <div className="relative h-[15vh] bg-white mb-6 text-primary border border-t-0 border-b-blue-300 shadow shadow-xl shadow-blue-100">
      <div className="absolute top-0 right-0 w-[70%] h-full bg-blue-600 clip-hero" />
      <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-500 clip-hero-center" />
      <h1 className="absolute top-1/2 left-8 transform -translate-y-1/2 text-5xl font-bold ml-20 z-10">{title}</h1>
    </div>
  );
};