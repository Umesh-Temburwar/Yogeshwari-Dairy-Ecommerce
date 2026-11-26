import React from 'react';

export interface NutritionFactItem {
  label: string;
  value: string;
}

export interface BlinkitDairyNutritionTableProps {
  facts?: NutritionFactItem[];
  servingSize?: string;
  className?: string;
}

const DEFAULT_DAIRY_NUTRITION: NutritionFactItem[] = [
  { label: 'Energy', value: '62 kcal' },
  { label: 'Milk Fat (Min)', value: '3.5%' },
  { label: 'Protein', value: '3.2 g' },
  { label: 'Carbohydrates', value: '4.8 g' },
  { label: 'Natural Sugars (Lactose)', value: '4.8 g' },
  { label: 'Calcium', value: '120 mg' },
];

export const BlinkitDairyNutritionTable: React.FC<BlinkitDairyNutritionTableProps> = ({
  facts = DEFAULT_DAIRY_NUTRITION,
  servingSize = '100 ml',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3 ${className}`}
      data-testid="blinkit-nutrition-table"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Nutritional Facts
        </h4>
        <span className="text-[11px] text-slate-500 font-semibold">Per {servingSize} approx.</span>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {facts.map((item) => (
          <div key={item.label} className="py-2 flex items-center justify-between">
            <span className="text-slate-600 font-medium">{item.label}</span>
            <span className="font-bold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
