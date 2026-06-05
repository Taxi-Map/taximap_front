import React from 'react';
import { Navigation } from 'lucide-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-blue-deep flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 bg-blue-atlantic rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-atlantic/40 animate-bounce">
          <Navigation className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-sky/30 rounded-full blur-md animate-pulse" />
      </div>
      <p className="mt-8 font-display text-2xl text-blue-horizon tracking-widest animate-pulse">
        TAXI MAP
      </p>
    </div>
  );
};

export default Loader;
