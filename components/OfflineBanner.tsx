
import React, { useState, useEffect } from 'react';

const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top duration-300">
      <div className="bg-amber-500/90 backdrop-blur-md text-background-dark py-2 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-xl">
        <span className="material-icons-round text-lg">cloud_off</span>
        <span>You are currently offline. AI features like summarizing and chat are unavailable.</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
