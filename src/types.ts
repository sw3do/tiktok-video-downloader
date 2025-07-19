/**
 * Information about a TikTok video including metadata, statistics, and media URLs
 */
export interface TikTokVideoInfo {
  /** Unique identifier for the video */
  id: string;
  /** Video title/description text */
  title: string;
  /** Video description (same as title) */
  description: string;
  /** Video duration in seconds */
  duration: number;
  /** Number of times the video has been viewed */
  playCount: number;
  /** Number of likes the video has received */
  likeCount: number;
  /** Number of comments on the video */
  commentCount: number;
  /** Number of times the video has been shared */
  shareCount: number;
  /** Unix timestamp when the video was created */
  createTime: number;
  /** Direct URL to the video file */
  videoUrl: string;
  /** URL to the video's cover/thumbnail image */
  coverUrl: string;
  /** URL to the video's dynamic cover (optional) */
  dynamicCoverUrl?: string;
  /** Information about the background music */
  music: {
    /** Unique identifier for the music track */
    id: string;
    /** Title of the music track */
    title: string;
    /** Artist/author of the music */
    author: string;
    /** Duration of the music in seconds */
    duration: number;
    /** Direct URL to the audio file */
    url: string;
  };
}

/**
 * Result object returned by the downloadVideo method
 */
export interface TikTokDownloadResult {
  /** Whether the download operation was successful */
  success: boolean;
  /** Human-readable message describing the result */
  message: string;
  /** Download data (only present if success is true) */
  data?: {
    /** Complete video information */
    videoInfo: TikTokVideoInfo;
    /** Available download URLs */
    downloadUrls: {
      /** URL to download the video (with watermark) */
      video: string;
      /** URL to download just the audio (optional) */
      audio?: string;
      /** URL to download the video without watermark (optional) */
      watermarkFree?: string;
    };
  };
  /** Error message (only present if success is false) */
  error?: string;
}

/**
 * Configuration options for the TikTokDownloader
 */
export interface TikTokDownloaderOptions {
  /** Whether to include watermark in downloaded videos (default: false) */
  includeWatermark?: boolean;
  /** Preferred video quality (default: 'high') */
  quality?: 'high' | 'medium' | 'low';
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom user agent string for requests */
  userAgent?: string;
}