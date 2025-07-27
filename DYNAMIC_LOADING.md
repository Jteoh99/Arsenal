# Dynamic File Loading System

The social feed application now uses a dynamic file loading system that automatically detects and loads posts, profiles, and replies from the `en-US` directory structure without requiring hardcoded lists.

## How It Works

### 1. File Manifest System
- A manifest file (`public/file-manifest.json`) contains a catalog of all available JSON files
- The manifest includes posts, profiles, and replies with their paths and metadata
- The manifest is automatically generated and can be updated when new files are added

### 2. Dynamic Discovery
- The application loads the manifest on startup and uses it to discover content
- New files are automatically included when the manifest is regenerated
- The system supports both nested and flat directory structures

### 3. Auto-Refresh Capability
- The application periodically checks for manifest updates (every 10 seconds)
- Users can manually refresh using the refresh button in the search bar
- When new content is detected, the application automatically updates

## File Structure

```
en-US/
├── Posts/
│   ├── [Profile]/
│   │   ├── [PostName].json
│   │   └── ...
│   └── [Profile]/[SubProfile]/
│       ├── [PostName].json
│       └── ...
├── Profiles/
│   ├── [ProfileName].json
│   ├── [Group]/
│   │   ├── [ProfileName].json
│   │   └── ...
│   └── ...
└── Replies/
    ├── UniqueReplies/
    │   └── [Profile]/[PostReply].json
    └── GenericReplies/
        └── [Profile]/[ReplyGroup].json
```

## Adding New Content

### Method 1: Automatic (Recommended)
1. Add your new JSON files to the appropriate directory in `en-US/`
2. The system will include them in the next manifest generation
3. Refresh the page or use the refresh button to see new content

### Method 2: Manual Manifest Update
1. Add your JSON files to the `en-US/` directory
2. Run `npm run generate-manifest` to update the manifest
3. Refresh the application to see the new content

## File Format Examples

### Post Format
```json
{
  "Name": "ProfileName/PostName",
  "Poster": "ProfileName",
  "Body": "Post content here...",
  "Image": "ImageName", // Optional
  "Tags": ["tag1", "tag2"], // Optional
  "Priority": 1 // Optional, higher = appears first
}
```

### Profile Format
```json
{
  "Name": "ProfileName",
  "DisplayName": "Display Name",
  "AccountName": "username",
  "Description": "Profile description",
  "Location": "User location",
  "JoinDate": "MM/DD/YYYY",
  "Followers": 100,
  "Following": ["User1", "User2"],
  "Prism": true // Optional premium status
}
```

### Reply Format
```json
{
  "PostName": "ProfileName/PostName", // For unique replies
  "Poster": "ReplyAuthor",
  "Body": "Reply content...",
  "Priority": 1, // Optional, lower = appears first
  "Tags": ["tag1", "tag2"] // For generic replies
}
```

## Features

### ✅ Implemented
- Dynamic file discovery using manifest system
- Auto-refresh every 10 seconds
- Manual refresh button with loading state
- Support for nested directory structures
- Backward compatibility with existing hardcoded paths
- Real-time manifest update detection
- Search functionality across all dynamic content
- Pagination with dynamic content

### 🔄 Auto-Update Process
1. Application loads initial manifest
2. Content is discovered and displayed
3. System periodically checks for manifest updates
4. When updates are detected, content is automatically refreshed
5. Users see the new content without manual intervention

## Benefits

1. **No Hardcoding**: No need to modify code when adding new posts/profiles
2. **Real-time Updates**: New content appears automatically when files are added
3. **Scalable**: Supports unlimited posts, profiles, and replies
4. **Maintainable**: Easy to add, remove, or modify content
5. **Performance**: Efficient loading and caching of content
6. **User-Friendly**: Visual feedback during refresh operations

## Usage for Content Creators

1. Create your JSON file following the format examples above
2. Place it in the appropriate directory under `en-US/`
3. Either wait for auto-detection or click the refresh button
4. Your content will appear in the feed immediately

The system is designed to be as hands-off as possible while providing maximum flexibility for content management.
