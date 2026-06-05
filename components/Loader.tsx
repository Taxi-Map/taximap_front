import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-blue-deep flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 bg-blue-atlantic rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-atlantic/40 animate-bounce">
          <img src="/icon/logo.png" alt="Taxi Map" className="w-10 h-10 object-contain" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-sky/30 rounded-full blur-md animate-pulse" />
      </div>
    </div>
  );
};

export default Loader;
