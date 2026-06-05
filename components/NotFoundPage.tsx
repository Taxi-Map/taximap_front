import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

function DashedRoute() {
  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-md h-24" preserveAspectRatio="xMidYMid meet">
      <path
        d="M10,50 C40,20 80,70 120,40 S160,60 190,50"
        fill="none"
        stroke="#F4A261"
        strokeWidth="3"
        strokeDasharray="6 6"
        strokeLinecap="round"
        className="animate-dash"
      />
      <circle cx="10" cy="50" r="5" fill="#F4A261" stroke="#0A1628" strokeWidth="2" />
      <circle cx="190" cy="50" r="5" fill="#EF4444" stroke="#0A1628" strokeWidth="2" />
      <text x="190" y="55" textAnchor="middle" fill="#EF4444" fontSize="16" fontWeight="bold">✕</text>
    </svg>
  );
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen bg-blue-deep overflow-hidden flex flex-col items-center justify-center px-6">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(109, 183, 226, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(109, 183, 226, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="absolute top-12 left-12 text-blue-sky/20 select-none">
        <Compass size={120} strokeWidth={1} />
      </div>
      <div className="absolute bottom-16 right-16 text-blue-sky/10 rotate-45 select-none">
        <Compass size={80} strokeWidth={1} />
      </div>

      <div
        className={`relative text-center transition-all duration-1000 ease-out ${
          reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-[clamp(6rem,20vw,14rem)] font-display text-amber-warm leading-none tracking-wide drop-shadow-[0_0_40px_rgba(244,162,97,0.15)]">
          404
        </div>

        <img
          src="/icon/logo.png"
          alt="Candongueiro perdido"
          className={`h-24 w-auto object-contain mx-auto mt-2 transition-all duration-1000 delay-200 ${
            reveal ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />

        <div className={`mt-4 flex justify-center transition-all duration-1000 delay-400 ${
          reveal ? 'opacity-100' : 'opacity-0'
        }`}>
          <DashedRoute />
        </div>

        <p className={`mt-2 text-blue-horizon text-lg sm:text-xl font-body font-medium tracking-wide transition-all duration-1000 delay-600 ${
          reveal ? 'opacity-100' : 'opacity-0'
        }`}>
          Rota não encontrada
        </p>

        <p className={`mt-3 text-slate-light/70 text-sm sm:text-base max-w-md mx-auto font-body leading-relaxed transition-all duration-1000 delay-700 ${
          reveal ? 'opacity-100' : 'opacity-0'
        }`}>
          O candongueiro perdeu-se no caminho. Esta página não existe ou foi movida para outro destino.
        </p>

        <div className={`mt-10 flex justify-center gap-4 transition-all duration-1000 delay-800 ${
          reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-body text-sm font-bold border border-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Página inicial
          </button>
          <button
            onClick={() => navigate('/map')}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-warm text-blue-deep font-display text-sm tracking-widest uppercase shadow-button hover:bg-amber-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao mapa
          </button>
        </div>
      </div>

      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-light/30 text-xs font-mono tracking-wider transition-all duration-1000 delay-1000 ${
        reveal ? 'opacity-100' : 'opacity-0'
      }`}>
        TAXI MAPA · ERRO 404
      </div>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        .animate-dash {
          animation: dash 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
