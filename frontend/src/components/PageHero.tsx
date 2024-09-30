import React, { useState, useEffect } from 'react';

interface PageHeroProps {
  title: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ title }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');

  useEffect(() => {
    setIsVisible(false);
    const timer1 = setTimeout(() => {
      setCurrentTitle(title);
      const timer2 = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer2);
    }, 500);
    return () => clearTimeout(timer1);
  }, [title]);

  return (
    <div className="relative h-[15vh] bg-white mb-6 text-primary border border-t-0 border-b-blue-300 shadow shadow-xl shadow-blue-100 overflow-hidden">
      <div className="absolute top-0 right-0 w-[70%] h-full bg-blue-600 clip-hero" />
      <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-500 clip-hero-center" />
      {currentTitle && (
        <h1 
          className={`
            absolute top-1/2 left-12 transform -translate-y-1/4 text-5xl font-bold
            transition-all duration-500 ease-out
            ${isVisible ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-full invisible'}
          `}
        >
          {currentTitle}
        </h1>
      )}
    </div>
  );
};