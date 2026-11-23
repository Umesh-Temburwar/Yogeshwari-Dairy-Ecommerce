import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { triggerHaptic } from '@/utils/haptics';

interface CatalogBreadcrumbsProps {
  categoryName?: string;
  brandName?: string;
  totalCount: number;
  onResetCategory?: () => void;
}

export const CatalogBreadcrumbs: React.FC<CatalogBreadcrumbsProps> = ({
  categoryName,
  brandName,
  totalCount,
  onResetCategory,
}) => {
  return (
    <nav className="flex items-center justify-between text-xs text-slate-500 py-1 px-1 flex-wrap gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          to="/"
          onClick={() => {
            triggerHaptic('light');
            if (onResetCategory) onResetCategory();
          }}
          className="flex items-center gap-1 text-slate-600 hover:text-[#2874F0] font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {categoryName && categoryName !== 'All Categories' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">{categoryName}</span>
          </>
        )}

        {brandName && brandName !== 'All' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#2874F0] font-bold">{brandName}</span>
          </>
        )}
      </div>

      <div className="text-[11px] text-slate-500">
        (Showing <strong className="text-slate-800 font-bold">{totalCount}</strong> products)
      </div>
    </nav>
  );
};
