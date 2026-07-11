import { useState, useEffect } from 'react';

export function SmartImage({ src, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        const separator = src.includes('?') ? '&' : '?';
        setCurrentSrc(`${src}${separator}retry=${retryCount + 1}`);
      }, 1000);
    } else {
      setIsLoading(false); // stop loading
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--cyber-black)]">
      {/* skeleton & animation*/}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse z-10" />
      )}

      <img
        src={currentSrc}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
      />
    </div>
  );
}