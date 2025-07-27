import React, { useState, useEffect } from 'react';
import { getImageSources, getVideoSources, isAnimatedImage } from '@/lib/mediaUtils';
import { MultiFormatImage } from './MultiFormatImage';

interface SmartMediaProps {
  filename: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  type?: 'image' | 'video' | 'auto';
}

/**
 * Smart media component that can display images or videos based on content
 * Handles GIFs, WebM videos, and other formats intelligently
 */
export function SmartMedia({ 
  filename, 
  alt, 
  className = "", 
  onClick,
  type = 'auto'
}: SmartMediaProps) {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    type === 'auto' ? 'image' : type
  );
  const [hasImageError, setHasImageError] = useState(false);

  // For GIFs and animated content, try video first for better performance
  useEffect(() => {
    if (type === 'auto' && isAnimatedImage(filename)) {
      // For animated images, try video sources first (WebM/MP4 equivalents)
      setMediaType('video');
    }
  }, [filename, type]);

  const handleImageError = () => {
    setHasImageError(true);
    if (type === 'auto') {
      // If image fails and we're in auto mode, try video
      setMediaType('video');
    }
  };

  const handleVideoError = () => {
    if (type === 'auto' && !hasImageError) {
      // If video fails in auto mode, fallback to image
      setMediaType('image');
    }
  };

  if (mediaType === 'video') {
    const videoSources = getVideoSources(filename);
    
    return (
      <video
        className={className}
        controls={!isAnimatedImage(filename)} // Don't show controls for GIF-like content
        autoPlay={isAnimatedImage(filename)} // Auto-play GIF-like content
        loop={isAnimatedImage(filename)} // Loop GIF-like content
        muted={isAnimatedImage(filename)} // Mute GIF-like content
        preload="metadata"
        onError={handleVideoError}
        onClick={onClick}
      >
        {videoSources.map((source, index) => (
          <source 
            key={index}
            src={source.src} 
            type={source.type} 
          />
        ))}
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <MultiFormatImage
      filename={filename}
      alt={alt}
      className={className}
      onClick={onClick}
      directory="Images"
    />
  );
}
