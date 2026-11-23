import React from 'react';
import { Product } from '@/types/ecommerce';
import { formatDisplayDate } from '@/utils/formatters';

interface ProductSpecificationsTableProps {
  product: Product;
}

export const ProductSpecificationsTable: React.FC<ProductSpecificationsTableProps> = ({
  product,
}) => {
  const specs = [
    { label: 'Brand', value: product.brand || 'Yogeshwari Dairy' },
    { label: 'Type', value: product.category || 'Dairy Products' },
    { label: 'Net Quantity', value: product.packSize || product.unit || 'Standard' },
    { label: 'Form', value: 'Fresh & Chilled' },
    { label: 'Organic', value: 'Yes (Farm Sourced)' },
    { label: 'Shelf Life', value: 'Perishable (Keep Refrigerated at 4°C)' },
    { label: 'FSSAI License', value: 'Certified Genuine Quality' },
    { label: 'Country of Origin', value: 'India (Ambajogai Mandi Hub)' },
  ];

  if (product.batchNo) {
    specs.push({ label: 'Batch Number', value: product.batchNo });
  }
  if (product.mfgDate) {
    specs.push({ label: 'Manufactured Date', value: formatDisplayDate(product.mfgDate) });
  }
  if (product.expiryDate) {
    specs.push({ label: 'Best Before / Expiry', value: formatDisplayDate(product.expiryDate) });
  }

  return (
    <div className="border border-slate-200 rounded-xs overflow-hidden text-xs">
      <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-extrabold text-slate-900 uppercase tracking-wide">
        Product Specifications
      </div>
      <div className="divide-y divide-slate-100">
        {specs.map((item) => (
          <div key={item.label} className="grid grid-cols-3 px-3.5 py-2">
            <span className="text-slate-500 font-medium col-span-1">{item.label}</span>
            <span className="text-slate-900 font-semibold col-span-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
