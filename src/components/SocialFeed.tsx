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
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return null;
  }
};

// Load profile by name
const loadProfile = async (profileName: string) => {
  return await loadJsonFile(`/en-US/Profiles/${profileName}.json`);
};

// Load post by filename
const loadPost = async (filename: string) => {
  return await loadJsonFile(`/en-US/Posts/${filename}.json`);
};

// Load unique replies for a post
const loadUniqueReplies = async (postName: string) => {
  const replyFiles = ["Hypnos_ChlorophyllExplanation.json"];

  const replies = [];
  for (const file of replyFiles) {
    const reply = await loadJsonFile(`/en-US/Replies/${file}`);
    if (reply && reply.PostName === postName) {
      replies.push(reply);
    }
  }
  return replies;
};

// Load generic replies that match post tags
const loadGenericReplies = async (tags: string[]) => {
  const genericFiles = [
    "Generic_PositiveResponses.json",
    "Generic_JungleDiscussion.json",
    "Generic_ArsenalInvestment.json",
  ];

  const matchingGroups = [];
  for (const file of genericFiles) {
    const group = await loadJsonFile(`/en-US/Replies/${file}`);
    if (group && group.Tags.some((tag: string) => tags.includes(tag))) {
      matchingGroups.push(group);
    }
  }
  return matchingGroups;
};

// Get profile picture path
const getProfilePicture = (profileName: string) => {
  const profilePictures = {
    Fanny: "/Assets/ProfilePictures/Fanny.png",
    Yharim: "/Assets/ProfilePictures/Yharim.png",
    XB10: "/Assets/ProfilePictures/NotFabsol.png",
    Hypnos: "/Assets/ProfilePictures/Default1.png",
  };
  return profilePictures[profileName] || "/Assets/ProfilePictures/Default1.png";
};

export default function SocialFeed() {
  const [posts, setPosts] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load posts
        const postFiles = [
          "Fanny_FantasticDay.json",
          "Yharim_JungleQuestion.json",
          "XB10_ArsenalStock.json",
        ];

        const loadedPosts = [];
        const loadedProfiles = {};

        for (const file of postFiles) {
          const post = await loadPost(file.replace(".json", ""));
          if (post) {
            // Load the poster's profile
            const profile = await loadProfile(post.Poster);
            if (profile) {
              loadedProfiles[post.Poster] = profile;
            }

            // Load replies for this post
            const uniqueReplies = await loadUniqueReplies(post.Name);
            const genericReplies = await loadGenericReplies(post.Tags);

            // Process replies
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
                  avatar: getProfilePicture(reply.Poster),
                  reactions: [reactionTypes[0], reactionTypes[1]], // heart and star only
                  priority: reply.Priority || 0,
                });
              }
            }

            // Add some random generic replies (limit to 2-3 per post)
            for (const group of genericReplies.slice(0, 1)) {
              const randomComments = group.Comments.sort(
                () => Math.random() - 0.5,
              ).slice(0, 2);

              for (const comment of randomComments) {
                const randomPoster =
                  group.Posters[
                    Math.floor(Math.random() * group.Posters.length)
                  ];
                if (randomPoster && loadedProfiles[randomPoster]) {
                  const profile = loadedProfiles[randomPoster];
                  comments.push({
                    id: `${post.Name}-generic-${Math.random()}`,
                    username: profile.DisplayName,
                    handle: `@${profile.AccountName}`,
                    content: comment,
                    timestamp: new Date(
                      Date.now() - Math.random() * 7200 * 1000,
                    ),
                    avatar: getProfilePicture(randomPoster),
                    reactions: [reactionTypes[0], reactionTypes[1]], // heart and star only
                    priority: 1,
                  });
                }
              }
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
              avatar: getProfilePicture(post.Poster),
              reactions: reactionTypes,
              comments: comments,
              priority: post.Priority || 0,
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
        <div className="flex-1 p-6">
          <ScrollArea className="h-[calc(100vh-3rem)]">
            {posts
              ? posts.map((post) => (
                  <div key={post.id} className="mb-6">
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
                        <div className="bg-slate-700 rounded-lg p-4 mb-2">
                          <p className="text-gray-100">{post.content}</p>
                        </div>
                        <div className="flex gap-4">
                          {post.reactions.map((reaction, idx) => (
                            <button
                              key={idx}
                              className="flex items-center gap-1 hover:scale-110 transition-transform text-gray-400 hover:text-white"
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
                            </button>
                          ))}
                        </div>

                        {/* Comments Section */}
                        {expandedComments.has(post.id) && (
                          <div className="mt-4 bg-slate-600 rounded-lg p-4">
                            <div className="mb-3">
                              <span className="text-sm font-semibold text-gray-300">
                                Comments
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
                        )}
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
          </ScrollArea>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-slate-900 p-4 space-y-6">
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
