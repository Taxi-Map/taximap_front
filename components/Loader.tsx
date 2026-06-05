import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-blue-deep flex items-center justify-center">
      <div className="relative">
        <div className="w-14 h-14 bg-blue-atlantic rounded-2xl flex items-center justify-center shadow-lg shadow-blue-atlantic/30 animate-bounce">
          <img src="/icon/logo.png" alt="Taxi Map" className="w-7 h-7 object-contain" />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-sky/30 rounded-full blur-sm animate-pulse" />
      </div>
    </div>
  );
};

export default Loader;
