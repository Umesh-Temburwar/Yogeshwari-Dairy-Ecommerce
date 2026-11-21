import { Order } from '@/types/ecommerce';

const STORE_PHONE = import.meta.env.VITE_STORE_PHONE || '+919370869896';
const rawDigits = STORE_PHONE.replace(/[^0-9]/g, '');
const CLEAN_STORE_PHONE = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

export function generateWhatsAppOrderMessage(order: Order): string {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. *${item.name}* (${item.packSize}) x ${item.quantity} = ₹${item.itemTotal}`)
    .join('\n');

  const addr = order.deliveryAddress;
  const addressText = `${addr.street}${addr.landmark ? `, Near ${addr.landmark}` : ''}, ${addr.city} - ${addr.pincode}`;

  const message = `🥛 *NEW DAIRY ORDER - Yogeshwari Dairy* 🥛
-------------------------------------
*Order ID:* #${order.orderNumber}
*Customer:* ${order.customerName} (${order.customerPhone})
*Delivery To:* ${addressText}
*Payment Mode:* ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI on Doorstep Delivery'}

*Items Ordered:*
${itemsText}

-------------------------------------
*Items Subtotal:* ₹${order.subtotal}
*Delivery Fee:* ${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
*Grand Total:* ₹${order.total}
-------------------------------------
${order.notes ? `*Special Notes:* ${order.notes}\n` : ''}
⚡ *Requested Delivery:* Within 15-20 Mins
Please confirm and prepare my delivery!`;

  return message;
}

export function openWhatsAppOrderConfirmation(order: Order) {
  const text = encodeURIComponent(generateWhatsAppOrderMessage(order));
  const url = `https://wa.me/${CLEAN_STORE_PHONE}?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openWhatsAppStoreInquiry() {
  const text = encodeURIComponent('Namaste Yogeshwari Dairy! I have an inquiry regarding fresh milk / dairy delivery.');
  const url = `https://wa.me/${CLEAN_STORE_PHONE}?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getStoreCallHref(): string {
  return `tel:${STORE_PHONE}`;
}
