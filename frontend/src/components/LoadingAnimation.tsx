import React, { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  onAnimationComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onAnimationComplete }) => {
  const [showLetters, setShowLetters] = useState<boolean[]>([]);
  const fullText = 'FireX';
  const directions = ['left', 'top', 'bottom', 'top', 'right'];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setShowLetters(prev => [...prev, true]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onAnimationComplete();
        }, 1000);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [onAnimationComplete]);

  const getLetterPosition = (index: number): { left: string, top: string } => {
    const basePosition = index * 1.8;
    const offset = fullText.length * 1.8 / 2; 
    let left = `calc(${basePosition}rem - ${offset}rem)`;
    let top = '0';

    switch (index) {
      case 1: 
        left = `calc(${basePosition + 0.7}rem - ${offset}rem)`;
        break;
      case 2: 
        left = `calc(${basePosition + 0.1}rem - ${offset}rem)`;
        top = '-4.5rem'
        break;
      case 4: 
        left = `calc(${basePosition - 2.8}rem - ${offset}rem)`;
        break;
    }

    return { left, top };
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="relative">
        {fullText.split('').map((char, index) => {
          const { left, top } = getLetterPosition(index);
          return (
            <span
              key={index}
              className={`
                absolute text-7xl font-bold text-primary
                transition-all duration-500 ease-out
                ${showLetters[index] ? 'opacity-100' : 'opacity-0'}
                ${getInitialPosition(directions[index])}
                ${showLetters[index] ? 'translate-x-0 translate-y-0' : ''}
              `}
              style={{
                transitionDelay: `${index * 300}ms`,
                left,
                top,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
};

function getInitialPosition(direction: string): string {
  switch (direction) {
    case 'left': return '-translate-x-full';
    case 'right': return 'translate-x-full';
    case 'top': return '-translate-y-full';
    case 'bottom': return 'translate-y-full';
    default: return '';
  }
}

export default LoadingAnimation;