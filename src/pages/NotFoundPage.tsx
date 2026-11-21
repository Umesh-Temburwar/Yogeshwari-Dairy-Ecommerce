import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Error 404
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or product category you are looking for does not exist or might have been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </Link>

          <a
            href="https://wa.me/919370869896?text=Namaste%20Yogeshwari%20Dairy,%20I%20need%20help%20finding%20a%20product%20on%20the%20website"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </main>
  );
};
