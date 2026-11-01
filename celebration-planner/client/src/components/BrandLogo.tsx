import React from 'react';
import { Link } from 'react-router-dom';
import { AlexText } from './AlexText';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: { title: 'text-xl', sub: 'text-[9px]' },
    md: { title: 'text-2xl', sub: 'text-[10px]' },
    lg: { title: 'text-3xl', sub: 'text-xs' },
  }[size];

  return (
    <Link to={to} className={`inline-flex flex-col items-start select-none group ${className}`}>
      <span className={`${sizeClasses.title} font-bold text-[#29213F] leading-none tracking-tight flex items-baseline`}>
        <AlexText scale="text-[1.3em]" className="text-[#29213F] group-hover:text-[#6035C4] transition-colors">
          Planora
        </AlexText>
      </span>
      {showSubtitle && (
        <span className={`${sizeClasses.sub} font-semibold text-[#71677F] tracking-wide mt-0.5 uppercase`}>
          Celebration Planner
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
