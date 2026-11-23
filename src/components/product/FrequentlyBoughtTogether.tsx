import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { formatPrice } from '@/utils/formatters';
import { useCartStore } from '@/store/cartStore';
import { triggerHaptic } from '@/utils/haptics';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  currentProduct,
}) => {
  const { addItem } = useCartStore();

  // Paired complementary item
  const pairedItem: Product = {
    id: 'combo-paneer-butter-pair',
    name: 'Fresh Dairy Khari & Toast 250g',
    description: 'Crisp oven-baked morning companion',
    category: 'Bakery',
    brand: 'Yogeshwari',
    packSize: '250 g',
    unit: 'Piece',
    price: 45,
    mrp: 50,
    discountPercentage: 10,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    inStock: true,
    stockQuantity: 25,
  };

  const comboTotal = currentProduct.price + pairedItem.price;
  const comboMrp = (currentProduct.mrp || currentProduct.price) + pairedItem.mrp;
  const comboSavings = comboMrp - comboTotal;

  const handleAddCombo = () => {
    triggerHaptic('medium');
    addItem(currentProduct);
    addItem(pairedItem);
  };

  return (
    <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50/70 text-xs space-y-3">
      <span className="font-extrabold text-slate-900 uppercase tracking-wide block">
        Frequently Bought Together
      </span>

      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        {/* Item 1 */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xs border border-slate-200 shrink-0">
          <img
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            className="w-12 h-12 object-contain"
          />
          <div className="max-w-[110px]">
            <span className="font-bold text-slate-800 line-clamp-1 block">
              {currentProduct.name}
            </span>
            <span className="font-bold text-slate-900">
              {formatPrice(currentProduct.price)}
            </span>
          </div>
        </div>

        <span className="text-slate-400 font-bold text-base shrink-0">+</span>

        {/* Item 2 */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xs border border-slate-200 shrink-0">
          <img
            src={pairedItem.imageUrl}
            alt={pairedItem.name}
            className="w-12 h-12 object-contain"
          />
          <div className="max-w-[110px]">
            <span className="font-bold text-slate-800 line-clamp-1 block">
              {pairedItem.name}
            </span>
            <span className="font-bold text-slate-900">
              {formatPrice(pairedItem.price)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-slate-500">Total Price:</span>
            <span className="font-black text-slate-900 text-sm">
              {formatPrice(comboTotal)}
            </span>
            {comboSavings > 0 && (
              <span className="text-[10px] text-[#388E3C] font-bold">
                (Save {formatPrice(comboSavings)})
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddCombo}
          className="px-3 py-1.5 bg-[#FF9F00] hover:bg-[#E58F00] text-white font-bold text-xs rounded-xs shadow-2xs cursor-pointer flex items-center gap-1"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add Both to Cart</span>
        </button>
      </div>
    </div>
  );
};
