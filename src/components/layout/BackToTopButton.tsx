import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic('light');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 z-30 w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#2874F0] border border-slate-200 shadow-float flex items-center justify-center cursor-pointer transition-all active:scale-90 animate-fade-in"
      title="Back to Top"
      aria-label="Back to Top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
