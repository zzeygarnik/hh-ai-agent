import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => (
  <span className="relative inline-flex group ml-1.5 align-middle">
    <Info className="w-3.5 h-3.5 text-[#888888] hover:text-[#FF6B1A] cursor-help transition-colors" />
    <span
      className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 w-64 -translate-x-1/2
                 rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] px-3 py-2 text-xs font-normal
                 normal-case tracking-normal text-[#e5e2e1] opacity-0 shadow-2xl
                 transition-opacity duration-150 group-hover:opacity-100"
    >
      {text}
    </span>
  </span>
);
