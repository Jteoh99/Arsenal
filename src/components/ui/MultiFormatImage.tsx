import React, { useState } from 'react';
import { getImageSources, type MediaSource } from '@/lib/mediaUtils';

interface MultiFormatImageProps {
  filename: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  directory?: string;
}

/**
 * Image component that tries multiple formats with fallbacks
 */
export function MultiFormatImage({ 
  filename, 
  alt, 
  className = "", 
  onClick,
  directory = "Images"
}: MultiFormatImageProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const sources = getImageSources(filename, directory);
  
  if (hasError || currentSourceIndex >= sources.length) {
    return null; // Hide if all formats fail
  }

  const currentSource = sources[currentSourceIndex];

  const handleError = () => {
    // Try next format
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      // All formats failed
      setHasError(true);
      console.warn(`Failed to load image with all formats: ${filename}`);
    }
  };

  return (
    <img
      src={currentSource.src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
      loading="lazy"
    />
  );
}

/**
 * Picture element with multiple format sources for better browser support
 */
export function MultiFormatPicture({ 
  filename, 
  alt, 
  className = "", 
  onClick,
  directory = "Images"
}: MultiFormatImageProps) {
  const sources = getImageSources(filename, directory);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  const handleError = () => {
    setHasError(true);
    console.warn(`Failed to load image: ${filename}`);
  };

  return (
    <picture onClick={onClick} className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.src}
          type={source.type}
        />
      ))}
      <img
        src={sources[0]?.src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleError}
        loading="lazy"
      />
    </picture>
  );
}
