
import React, { useState } from 'react';
import { Map as MapIcon, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl border border-slate-200 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${isMenuOpen ? 'rounded-[2rem] bg-white' : 'rounded-full bg-white/80 backdrop-blur-md'
        }`}
      style={{
        maxHeight: isMenuOpen ? '400px' : '80px', // h-16 sm:h-20 is 64px/80px
      }}
    >
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <img src="/icon/logo.png" alt="Taxi Map Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">Sobre</a>
            <a href="#vantagens" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">Vantagens</a>
            <a href="#impacto" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">Impacto</a>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-black hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg">
              Entrar
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-8 h-8" />
              ) : (
                <Menu className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content - Inline */}
      <div className={`md:hidden flex flex-col gap-2 px-6 pb-6 transition-opacity duration-300 delay-100 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-px w-full bg-slate-100 mb-2" />
        <a onClick={() => setIsMenuOpen(false)} href="#sobre" className="text-xl font-bold text-slate-600 hover:text-slate-900 py-3 px-4 hover:bg-slate-50 rounded-2xl transition-colors">Sobre</a>
        <a onClick={() => setIsMenuOpen(false)} href="#vantagens" className="text-xl font-bold text-slate-600 hover:text-slate-900 py-3 px-4 hover:bg-slate-50 rounded-2xl transition-colors">Vantagens</a>
        <a onClick={() => setIsMenuOpen(false)} href="#impacto" className="text-xl font-bold text-slate-600 hover:text-slate-900 py-3 px-4 hover:bg-slate-50 rounded-2xl transition-colors">Impacto</a>
        <button className="mt-2 bg-slate-900 text-white px-6 py-5 rounded-2xl text-xl font-black hover:bg-slate-800 active:scale-95 transition-all shadow-lg w-full">
          Entrar
        </button>
      </div>
    </nav>
  );
};
