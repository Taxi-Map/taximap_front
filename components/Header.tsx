import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl border border-white/10 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${
        isMenuOpen ? 'rounded-2xl bg-blue-deep' : 'rounded-full bg-blue-deep/90 backdrop-blur-md'
      }`}
      style={{
        maxHeight: isMenuOpen ? '400px' : '72px',
      }}
    >
      <div className="px-5 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <img src="/icon/logo.png" alt="Taxi Map" className="h-7 sm:h-8 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#sobre" className="text-xs font-bold text-blue-horizon hover:text-white transition-colors tracking-wider uppercase relative after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-amber-warm after:transition-all after:duration-300 hover:after:w-full">Sobre</a>
            <a href="#vantagens" className="text-xs font-bold text-blue-horizon hover:text-white transition-colors tracking-wider uppercase relative after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-amber-warm after:transition-all after:duration-300 hover:after:w-full">Vantagens</a>
            <a href="#impacto" className="text-xs font-bold text-blue-horizon hover:text-white transition-colors tracking-wider uppercase relative after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-amber-warm after:transition-all after:duration-300 hover:after:w-full">Impacto</a>
            <Link
              to="/map?login=true"
              className="bg-amber-warm text-blue-deep px-5 py-2.5 rounded-full text-xs font-bold hover:bg-amber-warm/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-warm/20 flex items-center gap-1.5"
            >
              Entrar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-blue-horizon hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

        <div className={`md:hidden flex flex-col gap-1.5 px-5 pb-5 transition-opacity duration-300 delay-100 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px w-full bg-white/10 mb-1.5" />
          <a onClick={() => setIsMenuOpen(false)} href="#sobre" className="text-lg font-bold text-blue-horizon hover:text-white py-2.5 px-4 hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-[0.98]">Sobre</a>
          <a onClick={() => setIsMenuOpen(false)} href="#vantagens" className="text-lg font-bold text-blue-horizon hover:text-white py-2.5 px-4 hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-[0.98]">Vantagens</a>
          <a onClick={() => setIsMenuOpen(false)} href="#impacto" className="text-lg font-bold text-blue-horizon hover:text-white py-2.5 px-4 hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-[0.98]">Impacto</a>
        <Link
          to="/map?login=true"
          onClick={() => setIsMenuOpen(false)}
          className="mt-1.5 bg-amber-warm text-blue-deep px-6 py-4 rounded-xl text-lg font-bold hover:bg-amber-warm/90 active:scale-95 transition-all shadow-lg w-full text-center"
        >
          Entrar
        </Link>
      </div>
    </nav>
  );
};
