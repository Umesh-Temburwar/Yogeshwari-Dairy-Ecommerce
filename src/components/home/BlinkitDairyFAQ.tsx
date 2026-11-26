import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do you deliver dairy products in 10-15 minutes?',
    answer:
      'We operate a dedicated quick-commerce micro-fulfillment center (dark store) directly inside Ambajogai Mandi Bazar. Our delivery partners are stationed locally with thermal insulated bags, ensuring ultra-fast doorstep dispatch.',
  },
  {
    question: 'How is the cold chain maintained for fresh milk and curd?',
    answer:
      'Milk, curd, and paneer are stored at a constant 4°C. When packed, temperature-controlled gel ice pads accompany delicate items to keep them chilled right until your refrigerator.',
  },
  {
    question: 'What is the daily morning delivery cutoff time?',
    answer:
      'Our dark store begins morning deliveries promptly at 6:00 AM. You can order fresh morning milk and pav anytime from 6:00 AM onwards for 10-15 minute arrival.',
  },
  {
    question: 'What if a pouch is damaged or curdled upon delivery?',
    answer:
      'We offer a 100% no-questions-asked instant replacement or refund. Simply message us on WhatsApp or call our Ambajogai hotline (+91 93708 69896) for immediate resolution.',
  },
];

export const BlinkitDairyFAQ: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    triggerHaptic('light');
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      className={`bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs my-4 ${className}`}
      data-testid="blinkit-dairy-faq"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500 leading-tight">
            Everything you need to know about our quick delivery promise
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={faq.question} className="py-3">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-emerald-700' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed animate-fade-in pl-1">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
