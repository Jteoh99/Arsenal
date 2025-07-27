export interface FileManifest {
  posts: Array<{
    path: string;
    profile: string;
    filename: string;
  }>;
  profiles: Array<{
    path: string;
    name: string;
  }>;
  replies: {
    unique: Array<{
      path: string;
      name: string;
    }>;
    generic: Array<{
      path: string;
      name: string;
    }>;
  };
  lastUpdated: string;
}

/**
 * Client-side function to load the file manifest
 */
export async function loadFileManifest(bustCache: boolean = false): Promise<FileManifest | null> {
  try {
    const url = bustCache
      ? `/file-manifest.json?t=${Date.now()}`
      : '/file-manifest.json';

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('File manifest not found, falling back to hardcoded paths');
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading file manifest:', error);
    return null;
  }
}

/**
 * Check if a file exists without loading its content
 */
export async function checkFileExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(`/en-US/${path}`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Load a JSON file from the en-US directory
 * This function is designed to NEVER throw errors - it always returns null on failure
 */
export async function loadJsonFile(path: string, retries = 0): Promise<any | null> {
  // Validate path
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return null;
  }

  // Sanitize path to prevent issues
  const cleanPath = path.replace(/^\/+|\/+$/g, '');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Triple-wrapped error handling to catch ALL possible errors
      let response: Response | null = null;

      try {
        response = await fetch(`/en-US/${cleanPath}`);
      } catch (fetchError) {
        // Any fetch-level error (network, CORS, etc.)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }
        return null;
      }

      if (!response || !response.ok) {
        // HTTP errors, null response, etc.
        return null;
      }

      // Try to parse JSON with extra error handling
      try {
        const text = await response.text();
        if (!text || text.trim() === '') {
          return null;
        }
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        // JSON parsing errors, text reading errors, etc.
        return null;
      }

    } catch (outerError) {
      // Catch any other unexpected errors
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
      return null;
    }
  }

  return null;
}

/**
 * Load profile by name using the manifest
 */
export async function loadProfile(profileName: string, manifest?: FileManifest): Promise<any | null> {
  if (manifest) {
    const profile = manifest.profiles.find(p => p.name === profileName);
    if (profile) {
      return await loadJsonFile(profile.path);
    }
  }
  
  // Fallback to direct path
  return await loadJsonFile(`Profiles/${profileName}.json`);
}

/**
 * Load all posts using the manifest
 */
export async function loadAllPosts(manifest?: FileManifest): Promise<any[]> {
  try {
    if (!manifest || !Array.isArray(manifest.posts)) {
      return [];
    }

    const posts = [];
    let successCount = 0;
    let failureCount = 0;

    // Process posts one by one to be extremely conservative
    for (const postEntry of manifest.posts) {
      try {
        if (!postEntry || !postEntry.path || typeof postEntry.path !== 'string') {
          failureCount++;
          continue;
        }

        const post = await loadJsonFile(postEntry.path);
        if (post && typeof post === 'object' && post.Name) {
          posts.push(post);
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        // Extra safety catch (shouldn't happen)
        failureCount++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    console.log(`Post loading complete: ${successCount} succeeded, ${failureCount} failed out of ${manifest.posts.length} total`);
    return posts;
  } catch (error) {
    console.warn('Error in loadAllPosts:', error);
    return [];
  }
}

/**
 * Load unique replies for a specific post using the manifest
 */
export async function loadUniqueRepliesForPost(postName: string, manifest?: FileManifest): Promise<any[]> {
  try {
    if (!manifest || !postName || typeof postName !== 'string' || !manifest.replies?.unique || !Array.isArray(manifest.replies.unique)) {
      return [];
    }

    const replies = [];

    // Process replies sequentially to avoid overwhelming the server
    for (const replyEntry of manifest.replies.unique) {
      try {
        if (!replyEntry || !replyEntry.path || typeof replyEntry.path !== 'string') {
          continue;
        }

        const reply = await loadJsonFile(replyEntry.path);
        if (reply && typeof reply === 'object' && reply.PostName === postName) {
          replies.push(reply);
        }
      } catch (error) {
        // Continue with next reply if one fails
        continue;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return replies;
  } catch (error) {
    console.warn('Error in loadUniqueRepliesForPost:', error);
    return [];
  }
}

/**
 * Load generic replies that match specific tags using the manifest
 */
export async function loadGenericRepliesForTags(tags: string[], manifest?: FileManifest): Promise<any[]> {
  try {
    if (!manifest || !Array.isArray(tags) || tags.length === 0 || !manifest.replies?.generic || !Array.isArray(manifest.replies.generic)) {
      return [];
    }

    const replies = [];

    // Process generic replies sequentially
    for (const replyEntry of manifest.replies.generic) {
      try {
        if (!replyEntry || !replyEntry.path || typeof replyEntry.path !== 'string') {
          continue;
        }

        const reply = await loadJsonFile(replyEntry.path);
        if (reply && typeof reply === 'object' && reply.Tags && Array.isArray(reply.Tags) &&
            reply.Tags.some((tag: string) => typeof tag === 'string' && tags.includes(tag))) {
          replies.push(reply);
        }
      } catch (error) {
        // Continue with next reply if one fails
        continue;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return replies;
  } catch (error) {
    console.warn('Error in loadGenericRepliesForTags:', error);
    return [];
  }
}
