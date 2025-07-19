# TikTok Video Downloader

A powerful TypeScript module for downloading TikTok videos and extracting detailed channel/account information.

## Features

- 📹 Download TikTok videos with or without watermark
- 🎵 Get music/audio information
- 📊 Retrieve video statistics (likes, comments, shares, views)
- 🔧 TypeScript support with full type definitions
- 🚀 Easy to use API
- 🛡️ Error handling and validation

## Installation

```bash
npm install sw3do-tiktok-video-downloader
```

## Quick Start

```typescript
import { TikTokDownloader } from 'sw3do-tiktok-video-downloader';

const downloader = new TikTokDownloader();

async function downloadVideo() {
  const result = await downloader.downloadVideo('https://www.tiktok.com/@username/video/1234567890');
  
  if (result.success) {
    console.log('Video Info:', result.data?.videoInfo);
    console.log('Download URLs:', result.data?.downloadUrls);
  } else {
    console.error('Error:', result.error);
  }
}

downloadVideo();
```

## API Reference

### TikTokDownloader

#### Constructor

```typescript
const downloader = new TikTokDownloader(options?);
```

**Options:**
- `includeWatermark?: boolean` - Include watermark in video (default: false)
- `quality?: 'high' | 'medium' | 'low'` - Video quality preference (default: 'high')
- `timeout?: number` - Request timeout in milliseconds (default: 30000)
- `userAgent?: string` - Custom user agent string

#### Methods

##### downloadVideo(url: string)

Downloads video information and provides download URLs.

```typescript
const result = await downloader.downloadVideo(tikTokUrl);
```

**Returns:** `TikTokDownloadResult`



## Types

### TikTokVideoInfo

```typescript
interface TikTokVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  playCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createTime: number;
  videoUrl: string;
  coverUrl: string;
  dynamicCoverUrl?: string;
  music: {
    id: string;
    title: string;
    author: string;
    duration: number;
    url: string;
  };
}
```



### TikTokDownloadResult

```typescript
interface TikTokDownloadResult {
  success: boolean;
  message: string;
  data?: {
    videoInfo: TikTokVideoInfo;
    downloadUrls: {
      video: string;
      audio?: string;
      watermarkFree?: string;
    };
  };
  error?: string;
}
```

## Usage Examples

### Basic Video Download

```typescript
import { TikTokDownloader } from 'sw3do-tiktok-video-downloader';

const downloader = new TikTokDownloader();

const result = await downloader.downloadVideo('https://www.tiktok.com/@user/video/123');

if (result.success && result.data) {
  const { videoInfo, downloadUrls } = result.data;
  
  console.log(`Title: ${videoInfo.title}`);
  console.log(`Likes: ${videoInfo.likeCount}`);
  console.log(`Video URL: ${downloadUrls.video}`);
  
  if (downloadUrls.watermarkFree) {
    console.log(`Watermark-free URL: ${downloadUrls.watermarkFree}`);
  }
}
```



### Custom Configuration

```typescript
const downloader = new TikTokDownloader({
  includeWatermark: true,
  quality: 'high',
  timeout: 60000
});
```

### Error Handling

```typescript
try {
  const result = await downloader.downloadVideo(url);
  
  if (!result.success) {
    console.error(`Failed: ${result.message}`);
    if (result.error) {
      console.error(`Error details: ${result.error}`);
    }
    return;
  }
  
  // Process successful result
  console.log('Video downloaded successfully!');
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Supported URL Formats

- `https://www.tiktok.com/@username/video/1234567890`
- `https://vm.tiktok.com/ZMxxxxxxxx`
- `https://vt.tiktok.com/ZSxxxxxxxx`
- `https://m.tiktok.com/v/1234567890`

## Notes

- This module respects TikTok's terms of service
- Use responsibly and in accordance with applicable laws
- Some features may be limited by TikTok's anti-bot measures
- Video availability depends on privacy settings and regional restrictions

## Documentation

Comprehensive API documentation is automatically generated using TypeDoc and deployed to GitHub Pages.

📖 **[View Documentation](https://sw3do.github.io/tiktok-video-downloader)**

### Building Documentation Locally

```bash
# Install dependencies
npm install

# Generate documentation
npm run docs:build

# The documentation will be generated in the 'docs' folder
```

## Publishing

This package is automatically published to npm when a new release is created on GitHub. The workflow also updates the documentation on GitHub Pages.

### Automatic Workflow

1. **On Push to Main**: Runs tests and updates documentation
2. **On Release**: Publishes to npm and updates documentation

### Manual Release Process

1. Update version in `package.json`
2. Create a new release on GitHub
3. The GitHub Action will automatically publish to npm

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.