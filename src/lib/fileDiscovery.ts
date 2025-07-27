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
export async function loadFileManifest(): Promise<FileManifest | null> {
  try {
    const response = await fetch('/file-manifest.json');
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
 * Load a JSON file from the en-US directory
 */
export async function loadJsonFile(path: string, retries = 1): Promise<any | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`/en-US/${path}`);
      if (!response.ok) {
        if (response.status !== 404) {
          console.warn(`Error loading ${path}: ${response.status} ${response.statusText}`);
        }
        return null;
      }
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        if (error instanceof Error && error.message.includes("Failed to fetch")) {
          console.warn(`Network error after ${retries + 1} attempts: ${path}`);
        } else {
          console.error(`Error parsing JSON from ${path}:`, error);
        }
        return null;
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100));
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
  if (!manifest) {
    console.warn('No manifest available, cannot load posts dynamically');
    return [];
  }

  const posts = [];
  
  for (const postEntry of manifest.posts) {
    try {
      const post = await loadJsonFile(postEntry.path);
      if (post) {
        posts.push(post);
      }
    } catch (error) {
      console.warn(`Failed to load post ${postEntry.path}:`, error);
    }
  }

  return posts;
}

/**
 * Load unique replies for a specific post using the manifest
 */
export async function loadUniqueRepliesForPost(postName: string, manifest?: FileManifest): Promise<any[]> {
  if (!manifest) {
    return [];
  }

  const replies = [];
  
  for (const replyEntry of manifest.replies.unique) {
    try {
      const reply = await loadJsonFile(replyEntry.path);
      if (reply && reply.PostName === postName) {
        replies.push(reply);
      }
    } catch (error) {
      console.warn(`Failed to load reply ${replyEntry.path}:`, error);
    }
  }

  return replies;
}

/**
 * Load generic replies that match specific tags using the manifest
 */
export async function loadGenericRepliesForTags(tags: string[], manifest?: FileManifest): Promise<any[]> {
  if (!manifest) {
    return [];
  }

  const replies = [];
  
  for (const replyEntry of manifest.replies.generic) {
    try {
      const reply = await loadJsonFile(replyEntry.path);
      if (reply && reply.Tags && reply.Tags.some((tag: string) => tags.includes(tag))) {
        replies.push(reply);
      }
    } catch (error) {
      console.warn(`Failed to load generic reply ${replyEntry.path}:`, error);
    }
  }

  return replies;
}
