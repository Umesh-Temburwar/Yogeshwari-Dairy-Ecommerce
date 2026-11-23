import React from 'react';
import { CheckCircle2, ThumbsUp } from 'lucide-react';
import { ProductReview } from '@/types/flipkart';

interface ProductReviewsListProps {
  productName: string;
}

const SAMPLE_REVIEWS: ProductReview[] = [
  {
    id: 'r1',
    author: 'Pooja Deshmukh',
    rating: 5,
    title: 'Superb Freshness & Pure Quality',
    comment: 'Delivered in just 12 minutes! The taste and malai thickness is 100% genuine farm fresh. Will order daily.',
    date: 'Yesterday',
    verifiedPurchase: true,
  },
  {
    id: 'r2',
    author: 'Sachin Kulkarni',
    rating: 5,
    title: 'Best Dairy in Ambajogai',
    comment: 'Softest paneer ever and the cow ghee aroma is unbeatable. Excellent packaging and friendly delivery person.',
    date: '3 days ago',
    verifiedPurchase: true,
  },
  {
    id: 'r3',
    author: 'Anjali Shinde',
    rating: 4,
    title: 'Very Good Taste & Timely Dispatch',
    comment: 'Authentic taste just like home village dairy. Very satisfied with the quick local delivery service.',
    date: '1 week ago',
    verifiedPurchase: true,
  },
];

export const ProductReviewsList: React.FC<ProductReviewsListProps> = ({ productName }) => {
  return (
    <div className="border border-slate-200 rounded-xs p-3.5 bg-white text-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-extrabold text-slate-900 uppercase tracking-wide">
          Customer Feedback for {productName}
        </span>
      </div>

      <div className="space-y-3 divide-y divide-slate-100">
        {SAMPLE_REVIEWS.map((rev) => (
          <div key={rev.id} className="pt-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs flex items-center gap-0.5">
                <span>{rev.rating}</span>
                <span>★</span>
              </span>
              <span className="font-bold text-slate-900 text-xs">{rev.title}</span>
            </div>

            <p className="text-slate-700 leading-relaxed text-xs">{rev.comment}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{rev.author}</span>
                {rev.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-[#388E3C] font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Certified Buyer, Ambajogai</span>
                  </span>
                )}
              </div>
              <span>{rev.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
