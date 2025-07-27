import React from 'react';

/**
 * Auto-refresh functionality to detect new files and update the manifest
 * This provides a way to refresh the data when new JSON files are added
 */

export interface RefreshConfig {
  intervalMs?: number;
  onUpdate?: (manifest: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Attempts to detect new files by trying to load commonly expected paths
 * This is a client-side workaround since we can't directly scan the filesystem
 */
export async function detectNewFiles(existingManifest: any): Promise<boolean> {
  // Try some common patterns for new files
  const potentialNewPaths = [
    // Try some common new profile patterns
    '/en-US/Profiles/NewUser.json',
    '/en-US/Profiles/TestUser.json',
    
    // Try some common new post patterns
    '/en-US/Posts/Fanny/NewPost.json',
    '/en-US/Posts/Yharim/LatestPost.json',
    '/en-US/Posts/NewUser/FirstPost.json',
    
    // Try some reply patterns
    '/en-US/Replies/UniqueReplies/NewUser/Reply.json'
  ];

  let hasNewFiles = false;

  for (const path of potentialNewPaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        // Found a file that exists but might not be in manifest
        const isInManifest = isPathInManifest(path, existingManifest);
        if (!isInManifest) {
          console.log(`Detected new file: ${path}`);
          hasNewFiles = true;
        }
      }
    } catch (error) {
      // File doesn't exist or other error, which is expected
    }
  }

  return hasNewFiles;
}

/**
 * Check if a path is already represented in the manifest
 */
function isPathInManifest(path: string, manifest: any): boolean {
  if (!manifest) return false;

  const normalizedPath = path.replace('/en-US/', '');
  
  // Check posts
  if (manifest.posts?.some((post: any) => normalizedPath.includes(post.path))) {
    return true;
  }
  
  // Check profiles
  if (manifest.profiles?.some((profile: any) => normalizedPath.includes(profile.path))) {
    return true;
  }
  
  // Check replies
  if (manifest.replies?.unique?.some((reply: any) => normalizedPath.includes(reply.path))) {
    return true;
  }
  
  if (manifest.replies?.generic?.some((reply: any) => normalizedPath.includes(reply.path))) {
    return true;
  }

  return false;
}

/**
 * Create an auto-refresh mechanism that periodically checks for updates
 */
export function createAutoRefresh(config: RefreshConfig = {}) {
  const { intervalMs = 10000, onUpdate, onError } = config;
  
  let currentManifest: any = null;
  let intervalId: NodeJS.Timeout | null = null;

  const checkForUpdates = async () => {
    try {
      // First, try to reload the manifest
      const response = await fetch('/file-manifest.json?t=' + Date.now());
      if (response.ok) {
        const newManifest = await response.json();
        
        // Check if manifest has changed
        if (!currentManifest || newManifest.lastUpdated !== currentManifest.lastUpdated) {
          console.log('Manifest updated:', newManifest.lastUpdated);
          currentManifest = newManifest;
          onUpdate?.(newManifest);
          return;
        }
      }

      // If manifest hasn't changed, try to detect new files
      if (currentManifest) {
        const hasNewFiles = await detectNewFiles(currentManifest);
        if (hasNewFiles) {
          console.log('Detected potential new files, suggesting refresh');
          // Could trigger a notification or automatic refresh here
          onUpdate?.(currentManifest);
        }
      }
    } catch (error) {
      console.warn('Error during auto-refresh check:', error);
      onError?.(error as Error);
    }
  };

  const start = () => {
    if (intervalId) return; // Already running
    
    // Initial check
    checkForUpdates();
    
    // Set up periodic checks
    intervalId = setInterval(checkForUpdates, intervalMs);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const forceCheck = () => {
    checkForUpdates();
  };

  return {
    start,
    stop,
    forceCheck,
    isRunning: () => intervalId !== null
  };
}

/**
 * Hook for React components to use auto-refresh
 */
export function useAutoRefresh(onUpdate: (manifest: any) => void, config: RefreshConfig = {}) {
  const [autoRefresh] = React.useState(() => 
    createAutoRefresh({ 
      ...config, 
      onUpdate 
    })
  );

  React.useEffect(() => {
    autoRefresh.start();
    return () => autoRefresh.stop();
  }, [autoRefresh]);

  return autoRefresh;
}
