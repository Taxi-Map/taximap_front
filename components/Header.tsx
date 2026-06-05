import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Menu, X, ArrowRight, LogOut, ChevronDown, User, Map } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileUserExpanded, setIsMobileUserExpanded] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl border border-white/10 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden md:overflow-visible ${
        isMenuOpen ? 'rounded-2xl bg-blue-deep backdrop-blur-md' : 'rounded-2xl bg-blue-deep/90 backdrop-blur-md'
      }`}
      style={{
        maxHeight: isMenuOpen ? '640px' : '72px',
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

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 pl-2 pr-3 py-1.5 rounded-full transition-all border border-white/10 cursor-pointer outline-none"
                >
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-atlantic flex items-center justify-center text-[10px] font-bold text-white">
                      {user.firstName?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white">{user.firstName}</span>
                  <ChevronDown className={`w-3 h-3 text-blue-horizon transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-blue-deep border border-white/10 rounded-xl shadow-xl z-50">
                    <button
                      onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs text-blue-horizon hover:text-white hover:bg-white/5 rounded-t-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      Perfil
                    </button>
                    <button
                      onClick={() => { navigate('/map'); setIsDropdownOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs text-blue-horizon hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Map className="w-3.5 h-3.5" />
                      Ir para o Mapa
                    </button>
                    <div className="h-px bg-white/5 mx-2" />
                    <button
                      onClick={() => { logout(); setIsDropdownOpen(false); toast.success('Sessão terminada.'); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs text-blue-horizon hover:text-white hover:bg-white/5 rounded-b-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/map?login=true"
                className="bg-amber-warm text-blue-deep px-5 py-2.5 rounded-full text-xs font-bold hover:bg-amber-warm/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-warm/20 flex items-center gap-1.5"
              >
                Entrar
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
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

          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => setIsMobileUserExpanded(!isMobileUserExpanded)}
                className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl mb-1 w-full text-left cursor-pointer hover:bg-white/10 transition-colors"
              >
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-9 h-9 rounded-full shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-atlantic flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user.firstName?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-light truncate">{user.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-blue-horizon shrink-0 transition-transform duration-200 ${isMobileUserExpanded ? 'rotate-180' : ''}`} />
                <button
                  onClick={(e) => { e.stopPropagation(); logout(); setIsMenuOpen(false); setIsMobileUserExpanded(false); toast.success('Sessão terminada.'); }}
                  className="text-slate-light hover:text-white transition-colors shrink-0 ml-1"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${isMobileUserExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1 pl-14 pr-2 pb-2">
                  <button
                    onClick={() => { navigate('/profile'); setIsMenuOpen(false); setIsMobileUserExpanded(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-horizon hover:text-white hover:bg-white/5 rounded-xl transition-all w-full text-left font-bold"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </button>
                  <button
                    onClick={() => { navigate('/map'); setIsMenuOpen(false); setIsMobileUserExpanded(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-horizon hover:text-white hover:bg-white/5 rounded-xl transition-all w-full text-left font-bold"
                  >
                    <Map className="w-4 h-4" />
                    Ir para o Mapa
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/map?login=true"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1.5 bg-amber-warm text-blue-deep px-6 py-4 rounded-xl text-lg font-bold hover:bg-amber-warm/90 active:scale-95 transition-all shadow-lg w-full text-center block"
            >
              Entrar
            </Link>
          )}

          <a onClick={() => { setIsMenuOpen(false); setIsMobileUserExpanded(false); }} href="#sobre" className="text-lg font-bold text-blue-horizon hover:text-white py-2.5 px-4 hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-[0.98]">Sobre</a>
          <a onClick={() => { setIsMenuOpen(false); setIsMobileUserExpanded(false); }} href="#vantagens" className="text-lg font-bold text-blue-horizon hover:text-white py-2.5 px-4 hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-[0.98]">Vantagens</a>
          <a onClick={() => { setIsMenuOpen(false); setIsMobileUserExpanded(false); }} href="#impacto" className="text-lg font-bold text-blue-horizon hover:text-white py-2.5 px-4 hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-[0.98]">Impacto</a>
      </div>
    </nav>
  );
};
