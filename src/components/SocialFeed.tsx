import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const reactionTypes = [
  { name: "heart", icon: "/Assets/Icons/Heart.webp", label: "Like" },
  { name: "star", icon: "/Assets/Icons/Star.webp", label: "Star" },
  { name: "comments", icon: "/Assets/Icons/Comments.webp", label: "Comment" },
];

// Helper function to load JSON files
const loadJsonFile = async (path: string) => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      // Silently handle 404s since we're probing for files
      if (response.status !== 404) {
        console.warn(`Error loading ${path}: ${response.status} ${response.statusText}`);
      }
      return null;
    }
    return await response.json();
  } catch (error) {
    // Handle network errors more gracefully
    if (error.message.includes("Failed to fetch")) {
      console.warn(`File not found or network error: ${path}`);
    } else {
      console.error(`Error parsing JSON from ${path}:`, error);
    }
    return null;
  }
};

// Load profile by name
const loadProfile = async (profileName: string) => {
  // Handle both nested and flat profile structures\n  return await loadJsonFile(`/en-US/Profiles/${profileName}.json`);
};

// Load post by profile and filename
const loadPost = async (profileName: string, filename: string) => {
  return await loadJsonFile(`/en-US/Posts/${profileName}/${filename}.json`);
};

// Comprehensive list of all known post files with their exact paths
const discoverAllPosts = async () => {
  const allPosts = [];

  // Define all known post paths based on the actual directory structure from project listing
  const knownPostPaths = [
    // Believers posts (nested structure) - confirmed to exist
    { profile: "Believers/Believer1", file: "FalseProphet" },
    { profile: "Believers/Believer10", file: "Indoctrination" },
    { profile: "Believers/Believer11", file: "FalseFlag" },
    { profile: "Believers/Believer12", file: "Martyr" },
    { profile: "Believers/Believer13", file: "NoxicRogue" },
    { profile: "Believers/Believer14", file: "NoxicMechanic" },
    { profile: "Believers/Believer15", file: "Clentaminator" },
    { profile: "Believers/Believer16", file: "OldDuke" },
    { profile: "Believers/Believer2", file: "Yharim" },
    { profile: "Believers/Believer3", file: "SlimeGod" },
    { profile: "Believers/Believer4", file: "BrimstoneElemental" },
    { profile: "Believers/Believer5", file: "Draedon" },
    { profile: "Believers/Believer6", file: "EidolonWyrms" },
    { profile: "Believers/Believer7", file: "Signus" },
    { profile: "Believers/Believer8", file: "Crusade" },
    { profile: "Believers/Believer9", file: "Plaguebringer" },

    // CalamityMod posts
    { profile: "CalamityMod", file: "YharonSky" },

    // Crusaders posts (nested structure)
    { profile: "Crusaders/Crusader1", file: "WheresYharim" },

    // DailyHeartlandsNews posts - all confirmed files
    { profile: "DailyHeartlandsNews", file: "AerieTheories" },
    { profile: "DailyHeartlandsNews", file: "BrimstoneCragsDiscovery" },
    { profile: "DailyHeartlandsNews", file: "DiggerShowcase" },
    { profile: "DailyHeartlandsNews", file: "DoGResprite" },
    { profile: "DailyHeartlandsNews", file: "ExoShowcase" },
    { profile: "DailyHeartlandsNews", file: "GauntletHorror" },
    { profile: "DailyHeartlandsNews", file: "HeroicDamageControversy" },
    { profile: "DailyHeartlandsNews", file: "ManaRevolution" },
    { profile: "DailyHeartlandsNews", file: "MurasamaPrototypeFootage" },
    { profile: "DailyHeartlandsNews", file: "NautilusAppears" },
    { profile: "DailyHeartlandsNews", file: "OldDukeSpeaks" },
    { profile: "DailyHeartlandsNews", file: "PerennialGroveDiscovery" },
    { profile: "DailyHeartlandsNews", file: "PinkCrystalDiscovery" },
    { profile: "DailyHeartlandsNews", file: "ProfanedBiomeEmergence" },
    { profile: "DailyHeartlandsNews", file: "SkyKingdomRelics" },
    { profile: "DailyHeartlandsNews", file: "StatisWarning" },
    { profile: "DailyHeartlandsNews", file: "YharmyMobilization" },

    // EvilFanny posts
    { profile: "EvilFanny", file: "HeavyMetal" },

    // Fanny posts
    { profile: "Fanny", file: "BabilHunting" },
    { profile: "Fanny", file: "FantasticDay" },
    { profile: "Fanny", file: "GoodMorning" },
    { profile: "Fanny", file: "Update" },

    // Ignalius posts
    { profile: "Ignalius", file: "RavagerCallout" },

    // MiracleBoy posts
    { profile: "MiracleBoy", file: "Cartwheel" },
    { profile: "MiracleBoy", file: "Dog" },

    // NotFabsol posts
    { profile: "NotFabsol", file: "Apology" },
    { profile: "NotFabsol", file: "BurnAtTheStake" },
    { profile: "NotFabsol", file: "ChildSoldiers" },
    { profile: "NotFabsol", file: "Lihzahrdphobia" },
    { profile: "NotFabsol", file: "PlagueDenial" },

    // Noxus posts
    { profile: "Noxus", file: "Xeroc" },

    // OldDuke posts
    { profile: "OldDuke", file: "YouDontExist" },

    // PlayerHater posts
    { profile: "PlayerHater", file: "BadMorning" },

    // Renault posts
    { profile: "Renault", file: "Advert1" },

    // Robyn posts - all confirmed files
    { profile: "Robyn", file: "Brimstone" },
    { profile: "Robyn", file: "Desert" },
    { profile: "Robyn", file: "Dreams" },
    { profile: "Robyn", file: "FunFact1" },
    { profile: "Robyn", file: "FunFact2" },
    { profile: "Robyn", file: "Hell" },
    { profile: "Robyn", file: "Jungle" },
    { profile: "Robyn", file: "LivingSituation" },
    { profile: "Robyn", file: "Ocean" },
    { profile: "Robyn", file: "Plague" },
    { profile: "Robyn", file: "Snow" },
    { profile: "Robyn", file: "Spread" },
    { profile: "Robyn", file: "SunkenSea" },
    { profile: "Robyn", file: "Surface" },
    { profile: "Robyn", file: "WhiteLotus" },
    { profile: "Robyn", file: "WorldEvil" },

    // XB10 posts
    { profile: "XB10", file: "ArsenalStock" },

    // XboxGamer posts
    { profile: "XboxGamer", file: "PlaguedPC" },
    { profile: "XboxGamer", file: "StupidHelper" },

    // Yharim posts
    { profile: "Yharim", file: "Cheating" },
    { profile: "Yharim", file: "GodMusic" },
    { profile: "Yharim", file: "JungleQuestion" },
    { profile: "Yharim", file: "MoreToxic" },
    { profile: "Yharim", file: "PrideMonth" },
    { profile: "Yharim", file: "Private" },
    { profile: "Yharim", file: "Salty" },
    { profile: "Yharim", file: "ShitOn" },
    { profile: "Yharim", file: "spit" },
  ];

  // Load each post with proper path handling
  for (const { profile, file } of knownPostPaths) {
    const post = await loadJsonFile(`/en-US/Posts/${profile}/${file}.json`);
    if (post && !allPosts.some((p) => p.Name === post.Name)) {
      allPosts.push(post);
    }
  }

  console.log(
    `Final discovered posts:`,
    allPosts.map((p) => p.Name),
  );
  return allPosts;
};

// Dynamically discover all unique reply files and create a mapping
const discoverUniqueReplies = async () => {
  const replyMapping = new Map();

  // Known unique reply files based on actual directory structure
  const knownUniqueReplies = [
    { path: "/en-US/Replies/UniqueReplies/Bluxunium/DoGResprite.json" },
    { path: "/en-US/Replies/UniqueReplies/BoneGod/DoGResprite.json" },
    { path: "/en-US/Replies/UniqueReplies/EvilFanny/BabilHunting.json" },
    { path: "/en-US/Replies/UniqueReplies/OldDuke/OldDukeSpeaks.json" },
    { path: "/en-US/Replies/UniqueReplies/Hypnos/ChlorophyllExplanation.json" },
    { path: "/en-US/Replies/UniqueReplies/Yharim/Private.json" },
    { path: "/en-US/Replies/UniqueReplies/Crusaders/Crusader11/WhatTheFuckDude.json" },
    { path: "/en-US/Replies/UniqueReplies/Yharim/PrideMonth/1.json" },
    { path: "/en-US/Replies/UniqueReplies/Yharim/PrideMonth/2.json" },
    { path: "/en-US/Replies/UniqueReplies/Yharim/PrideMonth/3.json" },
  ];

  for (const { path } of knownUniqueReplies) {
    const reply = await loadJsonFile(path);
    if (reply && reply.PostName) {
      if (!replyMapping.has(reply.PostName)) {
        replyMapping.set(reply.PostName, []);
      }
      replyMapping.get(reply.PostName).push(reply);
    }
  }

  return replyMapping;
};

// Load unique replies for a post using the discovered mapping
const loadUniqueReplies = async (postName: string, replyMapping: Map<string, any[]>) => {
  return replyMapping.get(postName) || [];
};

// Load generic replies that match post tags
const loadGenericReplies = async (tags: string[]) => {
  const profiles = ["Fanny", "XB10", "Yharim", "Draedon", "Hypnos"];
  const replyFileMap = {
    Fanny: ["PositiveResponses"],
    XB10: ["ArsenalInvestment"],
    Yharim: ["JungleDiscussion"],
    Draedon: [],
    Hypnos: [],
  };

  const matchingGroups = [];
  for (const profile of profiles) {
    const replyFiles = replyFileMap[profile] || [];
    for (const replyFile of replyFiles) {
      const group = await loadJsonFile(
        `/en-US/Replies/GenericReplies/${profile}/${replyFile}.json`,
      );
      if (group && group.Tags.some((tag: string) => tags.includes(tag))) {
        matchingGroups.push(group);
      }
    }
  }
  return matchingGroups;
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
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Discover unique replies mapping first
        const replyMapping = await discoverUniqueReplies();

        // Discover and load all posts dynamically
        const allPosts = await discoverAllPosts();
        console.log("Discovered posts:", allPosts.length, allPosts);

        const loadedPosts = [];
        const loadedProfiles = {};

        for (const post of allPosts) {
          if (post) {
            console.log("Processing post:", post.Name);
            // Load the poster's profile
            const profile = await loadProfile(post.Poster);
            if (profile) {
              loadedProfiles[post.Poster] = profile;
            }

            // Load unique replies for this post using the mapping
            const uniqueReplies = await loadUniqueReplies(post.Name, replyMapping);
            const comments = [];

            // Add unique replies
            for (const reply of uniqueReplies) {
              const replyProfile = await loadProfile(reply.Poster);
              if (replyProfile) {
                loadedProfiles[reply.Poster] = replyProfile;
              }

              // Add the reply even if profile fails to load
              const displayName = replyProfile?.DisplayName || reply.Poster;
              const accountName = replyProfile?.AccountName || reply.Poster.toLowerCase();

              comments.push({
                id: `${post.Name}-${reply.Poster}`,
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
  }, []);

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
          <div className="mb-4 pt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts, users, or replies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-400">
                Found {getFilteredPosts().length} result{getFilteredPosts().length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}
          </div>

          <div className="h-[634px] overflow-y-auto mr-[10px]" style={{padding: '0 12.5px 0 0'}}>
            {searchQuery && getFilteredPosts().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-center">No posts match your search for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
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
              <div className="flex flex-col items-center py-2 space-y-2">
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
