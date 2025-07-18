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
      // Don't log 404 errors since we're probing for files that might not exist
      if (response.status !== 404) {
        console.error(
          `Error loading ${path}: ${response.status} ${response.statusText}`,
        );
      }
      return null;
    }
    return await response.json();
  } catch (error) {
    // Only log unexpected errors, not network errors for missing files
    if (!error.message.includes("Failed to fetch")) {
      console.error(`Error loading ${path}:`, error);
    }
    return null;
  }
};

// Load profile by name
const loadProfile = async (profileName: string) => {
  return await loadJsonFile(`/en-US/Profiles/${profileName}.json`);
};

// Load post by profile and filename
const loadPost = async (profileName: string, filename: string) => {
  return await loadJsonFile(`/en-US/Posts/${profileName}/${filename}.json`);
};

// Discover all posts from all profiles
const discoverAllPosts = async () => {
  const allProfiles = [
    "Believers",
    "CalamityMod",
    "Crusaders",
    "DailyHeartlandsNews",
    "EvilFanny",
    "Fanny",
    "Ignalius",
    "MiracleBoy",
    "NotFabsol",
    "Noxus",
    "OldDuke",
    "PlayerHater",
    "Renault",
    "Robyn",
    "XB10",
    "XboxGamer",
    "Yharim",
  ];

  const allPosts = [];

  // Known posts for each profile based on current directory structure
  const profilePostMap = {
    Fanny: ["BabilHunting", "FantasticDay", "GoodMorning", "Update"],
    Yharim: [
      "Cheating",
      "GodMusic",
      "JungleQuestion",
      "MoreToxic",
      "PrideMonth",
      "Private",
      "Salty",
      "ShitOn",
      "spit",
    ],
    XB10: ["ArsenalStock"],
    EvilFanny: ["HeavyMetal"],
  };

  for (const profile of allProfiles) {
    const postFiles = profilePostMap[profile] || [];
    console.log(`Checking ${profile}:`, postFiles);

    for (const postFile of postFiles) {
      const post = await loadPost(profile, postFile);
      if (post) {
        console.log(`Loaded post: ${post.Name}`);
        allPosts.push(post);
      }
    }

    // For profiles without mapped posts, try common names
    if (postFiles.length === 0) {
      const commonPostFiles = [
        "Post",
        "Update",
        "Announcement",
        "News",
        "Question",
        "Comment",
      ];

      for (const postFile of commonPostFiles) {
        const post = await loadPost(profile, postFile);
        if (post && !allPosts.some((p) => p.Name === post.Name)) {
          allPosts.push(post);
        }
      }
    }
  }

  return allPosts;
};

// Load unique replies for a post
const loadUniqueReplies = async (postName: string) => {
  const profiles = [
    "Bluxunium",
    "BoneGod",
    "Crusaders",
    "EvilFanny",
    "Hypnos",
    "OldDuke",
    "Yharim",
  ];
  const replies = [];

  for (const profile of profiles) {
    // Try common reply file names
    const commonReplyFiles = [
      "ChlorophyllExplanation",
      "BabilHunting",
      "Private",
      "PrideMonth",
      "Reply",
      "Response",
      "Comment",
      "Answer",
    ];

    for (const replyFile of commonReplyFiles) {
      const reply = await loadJsonFile(
        `/en-US/Replies/UniqueReplies/${profile}/${replyFile}.json`,
      );
      if (reply && reply.PostName === postName) {
        replies.push(reply);
      }
    }
  }
  return replies;
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

// Get profile picture path using the profile's Name property
const getProfilePicture = (profileName: string, profileData?: any) => {
  // Use the Name property from the profile data if available
  const name = profileData?.Name || profileName;

  const profilePictures = {
    Fanny: "/Assets/ProfilePictures/Fanny.png",
    Yharim: "/Assets/ProfilePictures/Yharim.png",
    XB10: "/Assets/ProfilePictures/NotFabsol.png",
    Hypnos: "/Assets/ProfilePictures/Default1.png",
    EvilFanny: "/Assets/ProfilePictures/Fanny.png", // Use Fanny picture for EvilFanny
    NotFabsol: "/Assets/ProfilePictures/NotFabsol.png",
    // Add defaults for other profiles
    CalamityMod: "/Assets/ProfilePictures/Default1.png",
    Crusaders: "/Assets/ProfilePictures/Default1.png",
    DailyHeartlandsNews: "/Assets/ProfilePictures/Default1.png",
    Ignalius: "/Assets/ProfilePictures/Default1.png",
    MiracleBoy: "/Assets/ProfilePictures/Default1.png",
    Noxus: "/Assets/ProfilePictures/Default1.png",
    OldDuke: "/Assets/ProfilePictures/Default1.png",
    PlayerHater: "/Assets/ProfilePictures/Default1.png",
    Renault: "/Assets/ProfilePictures/Default1.png",
    Robyn: "/Assets/ProfilePictures/Default1.png",
    XboxGamer: "/Assets/ProfilePictures/Default1.png",
    Believers: "/Assets/ProfilePictures/Default1.png",
  };
  return profilePictures[name] || "/Assets/ProfilePictures/Default1.png";
};

export default function SocialFeed() {
  const [posts, setPosts] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [scrollWindow, setScrollWindow] = useState({ start: 0, end: 15 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
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

            // Load unique replies for this post
            const uniqueReplies = await loadUniqueReplies(post.Name);
            const comments = [];

            // Add unique replies
            for (const reply of uniqueReplies) {
              const replyProfile = await loadProfile(reply.Poster);
              if (replyProfile) {
                loadedProfiles[reply.Poster] = replyProfile;
                comments.push({
                  id: `${post.Name}-${reply.Poster}`,
                  username: replyProfile.DisplayName,
                  handle: `@${replyProfile.AccountName}`,
                  content: reply.Body,
                  timestamp: new Date(Date.now() - Math.random() * 3600 * 1000),
                  avatar: getProfilePicture(reply.Poster, replyProfile),
                  reactions: [reactionTypes[0], reactionTypes[1]],
                  priority: reply.Priority || 0,
                });
              }
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
            });
          }
        }

        // Sort posts by priority
        loadedPosts.sort((a, b) => b.priority - a.priority);

        setProfiles(loadedProfiles);
        setPosts(loadedPosts);
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to empty state
        setPosts([]);
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

  const handleScroll = (e) => {
    if (!posts || posts.length === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollRatio = scrollTop / (scrollHeight - clientHeight);

    // Calculate virtual window based on scroll position
    const windowSize = 15;
    const totalPosts = posts.length;
    const maxStart = Math.max(0, totalPosts - windowSize);

    // Calculate start position based on scroll ratio
    const newStart = Math.floor(scrollRatio * maxStart);
    const newEnd = Math.min(newStart + windowSize, totalPosts);

    setScrollWindow({ start: newStart, end: newEnd });
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white flex relative">
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
          <div className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer">
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
        <div className="flex-1 px-6 py-6">
          <div
            className="h-[calc(100vh-3rem)] pr-3 overflow-y-auto"
            onScroll={handleScroll}
          >
            {posts
              ? posts
                  .slice(scrollWindow.start, scrollWindow.end)
                  .map((post) => (
                    <div key={post.id} className="mb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={post.avatar}
                            alt={`${post.username} avatar`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">
                              {post.username}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {post.handle}
                            </span>
                          </div>
                          <div className="bg-slate-700 rounded-lg p-4 mb-3">
                            <p className="text-gray-100">{post.content}</p>
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
                            <div className="mt-4 bg-slate-600 rounded-lg p-4">
                              <div className="mb-3">
                                <span className="text-sm font-semibold text-gray-300">
                                  Comments ({post.comments.length})
                                </span>
                              </div>
                              <ScrollArea className="h-48">
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
                              </ScrollArea>
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

            {/* Virtual scroll info */}
            {posts && posts.length > 15 && (
              <div className="flex justify-center py-4 text-gray-400 text-sm">
                Showing {scrollWindow.start + 1}-{scrollWindow.end} of{" "}
                {posts.length} posts
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
    </div>
  );
}
