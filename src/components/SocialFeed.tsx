import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  loadFileManifest,
  loadJsonFile,
  loadProfile as loadProfileFromManifest,
  loadAllPosts,
  loadUniqueRepliesForPost,
  loadGenericRepliesForTags,
  type FileManifest
} from "@/lib/fileDiscovery";
import { useAutoRefresh } from "@/lib/autoRefresh";

const reactionTypes = [
  { name: "heart", icon: "/Assets/Icons/Heart.webp", label: "Like" },
  { name: "star", icon: "/Assets/Icons/Star.webp", label: "Star" },
  { name: "comments", icon: "/Assets/Icons/Comments.webp", label: "Comment" },
];

// Load profile by name (keeping for compatibility)
const loadProfile = async (profileName: string, manifest?: FileManifest) => {
  return await loadProfileFromManifest(profileName, manifest);
};

// Dynamic post discovery using manifest
const discoverAllPosts = async (manifest?: FileManifest) => {
  if (manifest) {
    console.log(`Loading ${manifest.posts.length} posts from manifest...`);
    return await loadAllPosts(manifest);
  }

  console.warn('No manifest available, posts will not be loaded dynamically');
  return [];
};

// Load unique replies for a post using the manifest
const loadUniqueReplies = async (postName: string, manifest?: FileManifest) => {
  if (manifest) {
    return await loadUniqueRepliesForPost(postName, manifest);
  }
  return [];
};

// Load generic replies that match post tags using the manifest
const loadGenericReplies = async (tags: string[], manifest?: FileManifest) => {
  if (manifest) {
    return await loadGenericRepliesForTags(tags, manifest);
  }
  return [];
};

// Get profile picture path dynamically based on available assets
const getProfilePicture = (profileName: string, profileData?: any) => {
  // Use the Name property from the profile data if available
  const name = profileData?.Name || profileName;

  // Extract the base name from nested profiles (e.g., "Believers/Believer1" -> "Believer1")
  const baseName = name.includes("/") ? name.split("/").pop() : name;

  // Available profile pictures based on actual assets
  const availableProfilePictures = [
    "Bluxunium",
    "CalamityMod",
    "CrimSon",
    "EvilFanny",
    "Fanny",
    "Ignalius",
    "NotFabsol",
    "Noxus",
    "OldDuke",
    "Renault",
    "Robyn",
    "XboxGamer",
    "Yharim",
  ];

  // Check if there's an exact match for the full name first
  if (availableProfilePictures.includes(name)) {
    return `/Assets/ProfilePictures/${name}.png`;
  }

  // Check if there's a match for the base name
  if (availableProfilePictures.includes(baseName)) {
    return `/Assets/ProfilePictures/${baseName}.png`;
  }

  // For Believers, use a default based on the believer number
  if (baseName?.startsWith("Believer")) {
    const believerNum = parseInt(baseName.replace("Believer", "")) || 1;
    const defaultNum = ((believerNum - 1) % 5) + 1; // Cycle through Default1-5
    return `/Assets/ProfilePictures/Default${defaultNum}.png`;
  }

  // For Crusaders, use a different default pattern
  if (baseName?.startsWith("Crusader")) {
    const crusaderNum = parseInt(baseName.replace("Crusader", "")) || 1;
    const defaultNum = ((crusaderNum - 1) % 5) + 1; // Cycle through Default1-5
    return `/Assets/ProfilePictures/Default${defaultNum}.png`;
  }

  // Default fallback
  return "/Assets/ProfilePictures/Default1.png";
};

export default function SocialFeed() {
  const [allPosts, setAllPosts] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [manifest, setManifest] = useState<FileManifest | null>(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastManifestCheck, setLastManifestCheck] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fileManifest = await loadFileManifest();
      if (fileManifest) {
        setLastManifestCheck(fileManifest.lastUpdated);
        console.log('Manual refresh completed');
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh setup
  useAutoRefresh((updatedManifest) => {
    if (updatedManifest.lastUpdated !== lastManifestCheck) {
      setLastManifestCheck(updatedManifest.lastUpdated);
    }
  }, { intervalMs: 10000 });

  // Initialize page and search from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const searchParam = urlParams.get('search');

    if (pageParam) {
      const pageNum = parseInt(pageParam);
      if (pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Update URL whenever page or search changes
  const updateUrl = (page: number, search: string) => {
    const url = new URL(window.location.href);

    if (page > 1) {
      url.searchParams.set('page', page.toString());
    } else {
      url.searchParams.delete('page');
    }

    if (search.trim()) {
      url.searchParams.set('search', search);
    } else {
      url.searchParams.delete('search');
    }

    window.history.replaceState({}, '', url);
  };

  const POSTS_PER_PAGE = 10;

  // Load manifest and data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the file manifest
        const fileManifest = await loadFileManifest();

        if (fileManifest) {
          setManifest(fileManifest);
          console.log('Loaded manifest:', fileManifest);

          // Check if manifest has been updated
          if (lastManifestCheck && lastManifestCheck !== fileManifest.lastUpdated) {
            console.log('Manifest updated, refreshing data...');
          }
          setLastManifestCheck(fileManifest.lastUpdated);
        }

        // Discover and load all posts dynamically using manifest
        const allPosts = await discoverAllPosts(fileManifest);
        console.log("Discovered posts:", allPosts.length, allPosts);

        const loadedPosts = [];
        const loadedProfiles = {};

        for (const post of allPosts) {
          if (post) {
            console.log("Processing post:", post.Name);
            // Load the poster's profile
            const profile = await loadProfile(post.Poster, fileManifest);
            if (profile) {
              loadedProfiles[post.Poster] = profile;
            }

            // Load unique replies for this post using the manifest
            const uniqueReplies = await loadUniqueReplies(post.Name, fileManifest);
            const comments = [];

            // Add unique replies
            for (let i = 0; i < uniqueReplies.length; i++) {
              const reply = uniqueReplies[i];
              const replyProfile = await loadProfile(reply.Poster, fileManifest);
              if (replyProfile) {
                loadedProfiles[reply.Poster] = replyProfile;
              }

              // Add the reply even if profile fails to load
              const displayName = replyProfile?.DisplayName || reply.Poster;
              const accountName = replyProfile?.AccountName || reply.Poster.toLowerCase();

              comments.push({
                id: `${post.Name}-${reply.Poster}-${i}`, // Add index to make IDs unique
                username: displayName,
                handle: `@${accountName}`,
                content: reply.Body,
                timestamp: new Date(Date.now() - Math.random() * 3600 * 1000),
                avatar: getProfilePicture(reply.Poster, replyProfile),
                reactions: [reactionTypes[0], reactionTypes[1]],
                priority: reply.Priority || 0,
              });
            }

            // Add some sample comments if no unique replies
            if (comments.length === 0) {
              const sampleComments = [
                {
                  id: `${post.Name}-comment-1`,
                  username: "Sample User",
                  handle: "@sampleuser",
                  content: "Great post!",
                  timestamp: new Date(Date.now() - Math.random() * 3600 * 1000),
                  avatar: getProfilePicture("Fanny"),
                  reactions: [reactionTypes[0], reactionTypes[1]],
                  priority: 1,
                },
              ];
              const numComments = Math.floor(Math.random() * 2);
              comments.push(...sampleComments.slice(0, numComments));
            }

            // Sort comments by priority
            comments.sort((a, b) => a.priority - b.priority);

            loadedPosts.push({
              id: loadedPosts.length + 1,
              name: post.Name,
              poster: post.Poster,
              username: loadedProfiles[post.Poster]?.DisplayName || post.Poster,
              handle: `@${loadedProfiles[post.Poster]?.AccountName || post.Poster}`,
              content: post.Body,
              timestamp: new Date(
                Date.now() - (loadedPosts.length + 1) * 3600 * 1000,
              ),
              avatar: getProfilePicture(
                post.Poster,
                loadedProfiles[post.Poster],
              ),
              reactions: reactionTypes,
              comments: comments,
              priority: post.Priority || 1,
              tags: post.Tags || [],
              image: post.Image || null,
            });
          }
        }

        // Sort posts by priority with randomization for same priority
        loadedPosts.sort((a, b) => {
          if (a.priority === b.priority) {
            // Randomize posts with same priority
            return Math.random() - 0.5;
          }
          return b.priority - a.priority;
        });

        setProfiles(loadedProfiles);
        setAllPosts(loadedPosts);
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to empty state
        setAllPosts([]);
      }
    };

    loadData();
  }, [lastManifestCheck]); // Re-run when manifest is updated

  // Periodically check for manifest updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fileManifest = await loadFileManifest();
        if (fileManifest && fileManifest.lastUpdated !== lastManifestCheck) {
          console.log('Manifest updated, will refresh data on next render');
          setLastManifestCheck(fileManifest.lastUpdated);
        }
      } catch (error) {
        console.warn('Failed to check for manifest updates:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [lastManifestCheck]);

  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth < 768;
      setIsSmallScreen(isSmall);
      if (isSmall) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleComments = (postId) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const goToPage = (page: number) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateUrl(page, searchQuery);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(getTotalPages());
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const hasMorePosts = () => {
    return getFilteredPosts().length > 0 && currentPage < getTotalPages();
  };

  const hasPreviousPage = () => {
    return currentPage > 1;
  };

  const getVisiblePageNumbers = () => {
    const totalPages = getTotalPages();
    const maxVisible = 5;
    const current = currentPage;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getFilteredPosts = () => {
    if (!allPosts) return [];

    if (!searchQuery.trim()) {
      return allPosts;
    }

    const query = searchQuery.toLowerCase();
    return allPosts.filter(post => {
      // Search in post content
      if (post.content.toLowerCase().includes(query)) {
        return true;
      }

      // Search in username/display name
      if (post.username.toLowerCase().includes(query)) {
        return true;
      }

      // Search in handle/account name
      if (post.handle.toLowerCase().includes(query)) {
        return true;
      }

      // Search in comments
      const hasMatchingComment = post.comments.some(comment => {
        return comment.content.toLowerCase().includes(query) ||
               comment.username.toLowerCase().includes(query) ||
               comment.handle.toLowerCase().includes(query);
      });

      return hasMatchingComment;
    });
  };

  const getCurrentPagePosts = () => {
    const filteredPosts = getFilteredPosts();
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredPosts = getFilteredPosts();
    return filteredPosts ? Math.ceil(filteredPosts.length / POSTS_PER_PAGE) : 0;
  };

  const playHypnosSound = () => {
    try {
      const audio = new Audio("/Assets/Sounds/ExoDeath.wav");
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    } catch (error) {
      console.log("Audio creation failed:", error);
    }
  };

  return (
    <div className="h-screen bg-slate-800 text-white flex relative overflow-hidden">
      {/* Toggle Button */}
      {isSmallScreen && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
          aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          <svg
            className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "rotate-0" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Left Sidebar */}
      <div
        className={`bg-slate-900 p-4 flex flex-col transition-all duration-300 ${
          isSmallScreen
            ? sidebarCollapsed
              ? "w-0 -translate-x-full opacity-0"
              : "w-64 translate-x-0 opacity-100 fixed left-0 top-0 h-full z-40"
            : "w-64"
        }`}
      >
        <div className="flex justify-center mb-8">
          <img
            src="/Assets/ArsenalLogo.png"
            alt="Arsenal Logo"
            className="h-16 w-full object-contain"
          />
        </div>

        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer">
            <img
              src="/Assets/Icons/Home.webp"
              alt="Home"
              className="w-8 h-8 object-contain"
            />
            <span>Home</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer">
            <img
              src="/Assets/Icons/Messages.webp"
              alt="Messages"
              className="w-8 h-8 object-contain"
            />
            <span>Messages</span>
          </div>
          <div
            className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer transition-colors"
            onClick={playHypnosSound}
          >
            <img
              src="/Assets/Icons/Hypnos.webp"
              alt="Hypnos"
              className="w-8 h-8 object-contain"
            />
            <span>Hypnos</span>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSmallScreen && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex transition-all duration-300 ${
          isSmallScreen ? "ml-0" : sidebarCollapsed ? "ml-0" : "ml-0"
        }`}
      >
        {/* Chat Feed */}
        <div className="flex-1 pl-6 pt-0 pb-0">
          {/* Search Bar */}
          <div className="mb-4 pr-4 pt-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search posts, users, or replies..."
                  value={searchQuery}
                  onChange={(e) => {
                    const newSearch = e.target.value;
                    setSearchQuery(newSearch);
                    setCurrentPage(1); // Reset to first page when searching
                    updateUrl(1, newSearch);
                  }}
                  className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  isRefreshing
                    ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title="Refresh posts and data"
              >
                <svg
                  className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-400">
                Found {getFilteredPosts().length} result{getFilteredPosts().length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}
            {manifest && (
              <div className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(manifest.lastUpdated).toLocaleString()} • {manifest.posts.length} posts • {manifest.profiles.length} profiles
              </div>
            )}
          </div>

          <div className="h-[634px] overflow-y-auto mr-[10px]" style={{padding: '0 12.5px 20px 0'}}>
            {searchQuery && getFilteredPosts().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-center">No posts match your search for "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                    updateUrl(1, "");
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : allPosts
              ? getCurrentPagePosts().map((post) => (
                  <div key={post.id} className="mb-8">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                        onClick={() =>
                          setSelectedProfile({
                            username: post.username,
                            poster: post.poster,
                            avatar: post.avatar,
                            handle: post.handle,
                          })
                        }
                      >
                        <img
                          src={post.avatar}
                          alt={`${post.username} avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() =>
                              setSelectedProfile({
                                username: post.username,
                                poster: post.poster,
                                avatar: post.avatar,
                                handle: post.handle,
                              })
                            }
                          >
                            {post.username}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {post.handle}
                          </span>
                        </div>
                        <div className="bg-slate-700 rounded-lg p-4 mb-3">
                          <p className="text-gray-100">{post.content}</p>
                          {/* Display image if available */}
                          {post.image && (
                            <img
                              src={`/Assets/Images/${post.image}.png`}
                              alt="Post image"
                              className="mt-3 rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() =>
                                setSelectedImage(
                                  `/Assets/Images/${post.image}.png`,
                                )
                              }
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                        <div className="flex gap-6">
                          {post.reactions.map((reaction, idx) => (
                            <button
                              key={idx}
                              className="flex items-center gap-2 hover:scale-110 transition-transform text-gray-400 hover:text-white"
                              title={reaction.label}
                              onClick={() => {
                                if (reaction.name === "comments") {
                                  toggleComments(post.id);
                                } else {
                                  console.log(
                                    `${reaction.label} clicked on post ${post.id}`,
                                  );
                                }
                              }}
                            >
                              <img
                                src={reaction.icon}
                                alt={reaction.label}
                                className="w-5 h-5 object-contain"
                              />
                              {reaction.name === "comments" && (
                                <span className="text-sm">
                                  {post.comments.length}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Comments Section with Animation */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedComments.has(post.id)
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="mt-4 bg-slate-700 rounded-lg p-4">
                            <div className="mb-3">
                              <span className="text-sm font-semibold text-gray-300">
                                Comments ({post.comments.length})
                              </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              <div className="space-y-3 pr-4">
                                {post.comments.length > 0 ? (
                                  post.comments.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="flex items-start gap-3"
                                    >
                                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                          src={comment.avatar}
                                          alt={`${comment.username} avatar`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-white text-sm">
                                            {comment.username}
                                          </span>
                                          <span className="text-gray-400 text-xs">
                                            {comment.handle}
                                          </span>
                                        </div>
                                        <p className="text-gray-200 text-sm mb-2">
                                          {comment.content}
                                        </p>
                                        <div className="flex gap-3">
                                          {comment.reactions.map(
                                            (reaction, idx) => (
                                              <button
                                                key={idx}
                                                className="flex items-center gap-1 hover:scale-110 transition-transform text-gray-400 hover:text-white"
                                                title={reaction.label}
                                                onClick={() =>
                                                  console.log(
                                                    `${reaction.label} clicked on comment ${comment.id}`,
                                                  )
                                                }
                                              >
                                                <img
                                                  src={reaction.icon}
                                                  alt={reaction.label}
                                                  className="w-4 h-4 object-contain"
                                                />
                                              </button>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-400 text-sm">
                                    No comments yet.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-full bg-slate-700" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-slate-700" />
                        <Skeleton className="h-16 w-full bg-slate-700" />
                      </div>
                    </div>
                  </div>
                ))}

            {/* Pagination Controls */}
            {allPosts && allPosts.length > POSTS_PER_PAGE && (
              <div className="flex flex-col items-center pt-1 pb-2 space-y-1">
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-3">
                  {/* First Page */}
                  <div
                    onClick={hasPreviousPage() ? goToFirstPage : undefined}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      !hasPreviousPage()
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-white hover:bg-slate-600"
                    }`}
                    title="First page"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Previous Page */}
                  <div
                    onClick={hasPreviousPage() ? goToPreviousPage : undefined}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      !hasPreviousPage()
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-white hover:bg-slate-600"
                    }`}
                    title="Previous page"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Page Numbers */}
                  {getVisiblePageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Page */}
                  <div
                    onClick={hasMorePosts() ? goToNextPage : undefined}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      !hasMorePosts()
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-white hover:bg-slate-600"
                    }`}
                    title="Next page"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Last Page */}
                  <div
                    onClick={hasMorePosts() ? goToLastPage : undefined}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      !hasMorePosts()
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-white hover:bg-slate-600"
                    }`}
                    title="Last page"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm-6 0a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Pagination Info - moved below buttons */}
                {allPosts && allPosts.length > 0 && (
                  <div className="text-center text-gray-400 text-sm">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div>Page {currentPage} of {getTotalPages()}</div>
                      <div className="mt-1">
                        Showing {getCurrentPagePosts().length} of {getFilteredPosts().length} posts
                        {searchQuery && ` (filtered from ${allPosts?.length || 0} total)`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-slate-900 p-4 space-y-6 ml-1">
          {/* Subscribe Widget */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/Assets/Icons/Prism.webp"
                alt="Prism"
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold">Subscribe to Prism</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to unlock new features and if eligible, receive a share
              of revenue.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
              Subscribe
            </button>
          </div>

          {/* Live Widget */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/Assets/Icons/Live.webp"
                alt="Live"
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold">Live on Arsenal:</span>
            </div>
            <p className="text-gray-300 text-sm">
              @YharimFan76 is hosting: Why Gods NEED to die! 8k Viewers
            </p>
          </div>

          {/* News Widget */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/Assets/Icons/News.webp"
                alt="News"
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold">News</span>
            </div>
            <p className="text-gray-300 text-sm">
              Memorial erected by Onyx Kinsmen in memory of the recently
              deceased Slime God.
            </p>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-screen-lg max-h-screen-lg">
            <img
              src={selectedImage}
              alt="Fullscreen image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          profiles={profiles}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ profile, profiles, onClose }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await fetch(`/en-US/Profiles/${profile.poster}.json`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [profile.poster]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="relative max-w-sm w-full mx-4">
          <div className="bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-t-2xl p-6 animate-pulse">
            <div className="w-24 h-24 bg-cyan-500 rounded-full mx-auto mb-4"></div>
          </div>
          <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-400 rounded mb-2"></div>
            <div className="h-4 bg-gray-400 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blue Header Section */}
        <div className="bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-t-2xl px-6 py-8 relative">
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-bold"
            onClick={onClose}
          >
            ✕
          </button>

          {/* Large Profile Picture */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Username and Handle */}
          <div className="text-center text-white">
            <h3 className="text-xl font-bold mb-1">{profile.username}</h3>
            <p className="text-cyan-100 text-sm">{profile.handle}</p>
          </div>
        </div>

        {/* Gray Content Section */}
        <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-2xl px-6 py-6 text-gray-800">
          {profileData && (
            <div className="space-y-4">
              {/* Description */}
              {profileData.Description && (
                <div className="text-center">
                  <p className="text-gray-800 font-medium italic">
                    {profileData.Description}
                  </p>
                </div>
              )}

              {/* Location */}
              {profileData.Location && (
                <div>
                  <p className="text-gray-800 font-semibold">
                    <span className="text-gray-700">Location:</span>{" "}
                    {profileData.Location}
                  </p>
                </div>
              )}

              {/* Join Date */}
              {profileData.JoinDate && (
                <div>
                  <p className="text-gray-800 font-semibold">
                    <span className="text-gray-700">Joined:</span>{" "}
                    {profileData.JoinDate}
                  </p>
                </div>
              )}

              {/* Followers and Following */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-500">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">
                    {profileData.Following ? profileData.Following.length : 0}
                  </p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">
                    {profileData.Followers !== undefined
                      ? profileData.Followers.toLocaleString()
                      : 0}
                  </p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
              </div>

              {/* Prism Status */}
              {profileData.Prism !== undefined && (
                <div className="text-center pt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profileData.Prism
                        ? "bg-yellow-400 text-yellow-900"
                        : "bg-gray-500 text-gray-100"
                    }`}
                  >
                    {profileData.Prism ? "✨ Prism Member" : "Standard Member"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
