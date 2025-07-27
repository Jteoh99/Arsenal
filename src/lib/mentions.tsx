import React from 'react';

export interface MentionClickHandler {
  (username: string): void;
}

/**
 * Parses text and converts @ mentions to clickable React elements
 * @param text - The text to parse
 * @param onMentionClick - Callback when a mention is clicked
 * @returns Array of React elements (text and clickable mentions)
 */
export function parseMentions(text: string, onMentionClick: MentionClickHandler): React.ReactNode[] {
  if (!text) return [text];

  // Regex to match @ mentions - alphanumeric, underscore, and common social media username characters
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const [fullMatch, username] = match;
    const startIndex = match.index;

    // Add text before the mention
    if (startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, startIndex));
    }

    // Add the clickable mention
    parts.push(
      <button
        key={`mention-${username}-${startIndex}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMentionClick(username);
        }}
        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
        title={`View ${username}'s profile`}
      >
        @{username}
      </button>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // Add remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * React component that renders text with clickable @ mentions
 */
export interface MentionTextProps {
  text: string;
  onMentionClick: MentionClickHandler;
  className?: string;
}

export function MentionText({ text, onMentionClick, className = "" }: MentionTextProps) {
  const parsedContent = parseMentions(text, onMentionClick);
  
  return (
    <span className={className}>
      {parsedContent}
    </span>
  );
}

/**
 * Extracts all @ mentions from text
 * @param text - The text to extract mentions from
 * @returns Array of usernames (without @)
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Checks if text contains any @ mentions
 */
export function hasMentions(text: string): boolean {
  return /@[a-zA-Z0-9_]+/.test(text);
}
