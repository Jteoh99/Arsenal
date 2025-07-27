#!/usr/bin/env node

import { readdir, stat, writeFile } from 'fs/promises';
import { join, relative } from 'path';

/**
 * Recursively scans a directory and returns all JSON files
 */
async function scanDirectory(dirPath, extensions = ['.json']) {
  const files = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Generates a manifest of all available files in the en-US directory
 */
async function generateFileManifest() {
  const basePath = './en-US';
  
  try {
    // Check if en-US directory exists
    await stat(basePath);
  } catch (error) {
    console.error('en-US directory not found. Make sure you are running this from the project root.');
    process.exit(1);
  }

  console.log('Scanning en-US directory for JSON files...');
  
  // Discover all posts
  const postPaths = await scanDirectory(join(basePath, 'Posts'));
  const posts = postPaths.map(path => {
    const relativePath = relative(basePath, path);
    const parts = relativePath.split('/');
    // Remove 'Posts' and '.json' to get profile and filename
    const profile = parts.slice(1, -1).join('/'); // Everything between Posts and filename
    const filename = parts[parts.length - 1].replace('.json', '');
    
    return {
      path: relativePath.replace(/\\/g, '/'), // Normalize path separators
      profile,
      filename
    };
  });

  // Discover all profiles
  const profilePaths = await scanDirectory(join(basePath, 'Profiles'));
  const profiles = profilePaths.map(path => {
    const relativePath = relative(basePath, path);
    const name = relativePath.replace('Profiles/', '').replace('Profiles\\', '').replace('.json', '');
    
    return {
      path: relativePath.replace(/\\/g, '/'), // Normalize path separators
      name
    };
  });

  // Discover unique replies
  const uniqueReplyPaths = await scanDirectory(join(basePath, 'Replies', 'UniqueReplies'));
  const uniqueReplies = uniqueReplyPaths.map(path => {
    const relativePath = relative(basePath, path);
    const name = relativePath
      .replace('Replies/UniqueReplies/', '')
      .replace('Replies\\UniqueReplies\\', '')
      .replace('.json', '');
    
    return {
      path: relativePath.replace(/\\/g, '/'), // Normalize path separators
      name
    };
  });

  // Discover generic replies
  const genericReplyPaths = await scanDirectory(join(basePath, 'Replies', 'GenericReplies'));
  const genericReplies = genericReplyPaths.map(path => {
    const relativePath = relative(basePath, path);
    const name = relativePath
      .replace('Replies/GenericReplies/', '')
      .replace('Replies\\GenericReplies\\', '')
      .replace('.json', '');
    
    return {
      path: relativePath.replace(/\\/g, '/'), // Normalize path separators
      name
    };
  });

  const manifest = {
    posts,
    profiles,
    replies: {
      unique: uniqueReplies,
      generic: genericReplies
    },
    lastUpdated: new Date().toISOString()
  };

  // Write manifest to public directory
  const manifestPath = './public/file-manifest.json';
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Generated manifest with:`);
  console.log(`   - ${posts.length} posts`);
  console.log(`   - ${profiles.length} profiles`);
  console.log(`   - ${uniqueReplies.length} unique replies`);
  console.log(`   - ${genericReplies.length} generic replies`);
  console.log(`📄 Manifest saved to ${manifestPath}`);
  
  return manifest;
}

// Run the manifest generation
generateFileManifest().catch(error => {
  console.error('Error generating manifest:', error);
  process.exit(1);
});
