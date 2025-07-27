/**
 * Utility functions for handling media files with multiple format support
 */

export interface MediaSource {
  src: string;
  type: string;
}

/**
 * Image formats supported for embeds
 */
export const IMAGE_FORMATS = [
  { ext: 'png', type: 'image/png' },
  { ext: 'jpg', type: 'image/jpeg' },
  { ext: 'jpeg', type: 'image/jpeg' },
  { ext: 'webp', type: 'image/webp' },
  { ext: 'gif', type: 'image/gif' }
];

/**
 * Video formats supported for embeds
 */
export const VIDEO_FORMATS = [
  { ext: 'mp4', type: 'video/mp4' },
  { ext: 'webm', type: 'video/webm' },
  { ext: 'mov', type: 'video/quicktime' },
  { ext: 'avi', type: 'video/x-msvideo' },
  { ext: 'mkv', type: 'video/x-matroska' }
];

/**
 * Generate image sources with fallback formats
 * @param filename - The base filename without extension
 * @param directory - The directory path (e.g., 'Images')
 * @returns Array of image sources to try
 */
export function getImageSources(filename: string, directory: string = 'Images'): MediaSource[] {
  return IMAGE_FORMATS.map(format => ({
    src: `/Assets/${directory}/${filename}.${format.ext}`,
    type: format.type
  }));
}

/**
 * Generate video sources with fallback formats  
 * @param filename - The base filename without extension
 * @param directory - The directory path (e.g., 'Videos')
 * @returns Array of video sources to try
 */
export function getVideoSources(filename: string, directory: string = 'Videos'): MediaSource[] {
  return VIDEO_FORMATS.map(format => ({
    src: `/Assets/${directory}/${filename}.${format.ext}`,
    type: format.type
  }));
}

/**
 * Get the primary (first) image source for a filename
 */
export function getPrimaryImageSrc(filename: string, directory: string = 'Images'): string {
  const sources = getImageSources(filename, directory);
  return sources[0]?.src || '';
}

/**
 * Get the primary (first) video source for a filename
 */
export function getPrimaryVideoSrc(filename: string, directory: string = 'Videos'): string {
  const sources = getVideoSources(filename, directory);
  return sources[0]?.src || '';
}

/**
 * Check if a file extension is a supported image format
 */
export function isImageFormat(extension: string): boolean {
  return IMAGE_FORMATS.some(format => format.ext.toLowerCase() === extension.toLowerCase());
}

/**
 * Check if a file extension is a supported video format
 */
export function isVideoFormat(extension: string): boolean {
  return VIDEO_FORMATS.some(format => format.ext.toLowerCase() === extension.toLowerCase());
}

/**
 * Determine if a filename should be treated as an animated image (GIF)
 */
export function isAnimatedImage(filename: string): boolean {
  return filename.toLowerCase().includes('.gif') || filename.toLowerCase().endsWith('gif');
}
