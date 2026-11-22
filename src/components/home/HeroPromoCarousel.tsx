import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { PromotionalBanner, BannerLinkType } from '@/types/ecommerce';
import { DEFAULT_PROMOTIONAL_BANNERS } from '@/constants/banners';
import { supabase } from '@/services/supabase/client';
import { triggerHaptic } from '@/utils/haptics';

interface HeroPromoCarouselProps {
  onSelectCategory: (categorySlug: string) => void;
  onSelectBrand: (brandName: string) => void;
}

export const HeroPromoCarousel: React.FC<HeroPromoCarouselProps> = ({
  onSelectCategory,
  onSelectBrand,
}) => {
  const [banners, setBanners] = useState<PromotionalBanner[]>(DEFAULT_PROMOTIONAL_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe detection refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch active banners from Supabase
  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(5);

      if (!error && data && data.length > 0) {
        const mapped: PromotionalBanner[] = data.map((row: any) => ({
          id: String(row.id),
          title: String(row.title),
          subtitle: row.subtitle ? String(row.subtitle) : undefined,
          imageUrl: String(row.image_url),
          linkType: (row.link_type || 'CATEGORY').toUpperCase() as BannerLinkType,
          linkTarget: String(row.link_target),
          badgeText: row.badge_text ? String(row.badge_text) : undefined,
          bgColor: row.bg_color ? String(row.bg_color) : undefined,
          displayOrder: Number(row.display_order) || 1,
          isActive: Boolean(row.is_active),
        }));
        setBanners(mapped);
      } else {
        setBanners(DEFAULT_PROMOTIONAL_BANNERS);
      }
    } catch {
      setBanners(DEFAULT_PROMOTIONAL_BANNERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and Realtime sync
  useEffect(() => {
    fetchBanners();

    // Supabase Realtime channel for live updates from ERP
    const channel = supabase
      .channel('promotional-banners-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotional_banners' },
        () => {
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBanners]);

  // Next Slide Handler
  const goToNext = useCallback(() => {
    if (banners.length <= 1) return;
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // Prev Slide Handler
  const goToPrev = useCallback(() => {
    if (banners.length <= 1) return;
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-slide every 4 seconds (pauses on hover or touch)
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, banners.length]);

  // Touch Swipe Handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      // Minimum swipe threshold 40px
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => setIsPaused(false), 1000);
  };

  // 1-Tap Click Navigation
  const handleBannerClick = (banner: PromotionalBanner) => {
    triggerHaptic('medium');
    const type = (banner.linkType || 'CATEGORY').toUpperCase();

    if (type === 'CATEGORY') {
      onSelectCategory(banner.linkTarget);
    } else if (type === 'BRAND') {
      onSelectBrand(banner.linkTarget);
    } else if (type === 'EXTERNAL') {
      window.open(banner.linkTarget, '_blank', 'noopener,noreferrer');
      return;
    }

    // Smoothly scroll down to product section
    setTimeout(() => {
      const targetEl =
        document.getElementById(`category-section-${banner.linkTarget}`) ||
        document.getElementById('products-section') ||
        document.getElementById('catalog-main-content');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/7] sm:h-44 md:h-52 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse border border-slate-200/80 shadow-xs" />
    );
  }

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 select-none group bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional banner carousel"
    >
      {/* Banner Slide Frame */}
      <div
        className="relative w-full aspect-[16/7] sm:h-44 md:h-52 cursor-pointer overflow-hidden"
        onClick={() => handleBannerClick(currentBanner)}
      >
        {/* Background Image with smooth fade */}
        <img
          key={currentBanner.id}
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          loading="eager"
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-103"
        />

        {/* Ambient Dark Gradient Overlay for Maximum Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Slide Content Overlay */}
        <div className="absolute inset-0 p-3.5 sm:p-5 md:p-6 flex flex-col justify-between z-10">
          {/* Top Badge */}
          <div className="flex items-center gap-2">
            {currentBanner.badgeText ? (
              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>{currentBanner.badgeText}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs">
                <span>YOGESHWARI FRESH</span>
              </span>
            )}
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-[80%] sm:max-w-md md:max-w-lg space-y-1">
            <h2 className="text-white font-extrabold text-sm sm:text-lg md:text-xl leading-tight line-clamp-2 drop-shadow-sm tracking-tight">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-white/90 text-[10.5px] sm:text-xs font-medium leading-snug line-clamp-2 drop-shadow-2xs">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          {/* Bottom Action CTA */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-xs transition-colors">
              <span>Order Now</span>
              <ArrowRight className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Prev / Next Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="hidden md:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-md"
            aria-label="Previous promotional slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-md"
            aria-label="Next promotional slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Slide Navigation Indicator Pills (Centered at bottom) */}
      {banners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs">
          {banners.map((banner, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={banner.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={isActive}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
