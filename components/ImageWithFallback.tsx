
import React, { useState } from 'react';

interface Props {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<Props> = ({ src, alt, className, fallbackText }) => {
  const [error, setError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold text-2xl ${className}`}>
        {fallbackText || getInitials(alt)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;
