import React from 'react';

interface PureAssuredBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const PureAssuredBadge: React.FC<PureAssuredBadgeProps> = ({
  className = '',
  size = 'sm',
}) => {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 select-none font-sans ${className}`}
      title="Yogeshwari Pure Assured Quality Guarantee"
    >
      <span className="inline-flex items-center font-bold tracking-tight text-white bg-[#2874F0] px-1.5 py-0.5 rounded-xs shadow-2xs leading-none text-[10px]">
        <span className="italic mr-0.5 text-blue-100">Pure</span>
        <span className="text-[#FFE500]">Assured</span>
        <span className="ml-1 text-[9px] text-[#FFE500]">✓</span>
      </span>
    </span>
  );
};
