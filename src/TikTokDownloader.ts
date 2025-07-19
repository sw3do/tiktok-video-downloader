/**
 * @fileoverview TikTok Video Downloader implementation
 */

import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { TikTokVideoInfo, TikTokDownloadResult, TikTokDownloaderOptions } from './types';

let UserAgent: any;
try {
  UserAgent = require('user-agents');
} catch (error) {
  UserAgent = null;
}

/**
 * Main class for downloading TikTok videos and extracting video information
 * @example
 * ```typescript
 * const downloader = new TikTokDownloader({
 *   includeWatermark: false,
 *   quality: 'high',
 *   timeout: 30000
 * });
 * 
 * const result = await downloader.downloadVideo('https://www.tiktok.com/@user/video/123');
 * if (result.success) {
 *   console.log(result.data?.videoInfo.title);
 * }
 * ```
 */
export class TikTokDownloader {
  private options: Required<TikTokDownloaderOptions>;
  private userAgent: string;

  /**
   * Creates a new TikTokDownloader instance
   * @param options - Configuration options for the downloader
   */
  constructor(options: TikTokDownloaderOptions = {}) {
    this.options = {
      includeWatermark: options.includeWatermark ?? false,
      quality: options.quality ?? 'high',
      timeout: options.timeout ?? 30000,
      userAgent: options.userAgent ?? (UserAgent ? new UserAgent().toString() : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    };
    this.userAgent = this.options.userAgent;
  }

  /**
   * Downloads video information and provides download URLs for a TikTok video
   * @param url - The TikTok video URL to download
   * @returns Promise resolving to download result with video info and URLs
   * @example
   * ```typescript
   * const result = await downloader.downloadVideo('https://www.tiktok.com/@user/video/123');
   * if (result.success && result.data) {
   *   console.log(`Title: ${result.data.videoInfo.title}`);
   *   console.log(`Video URL: ${result.data.downloadUrls.video}`);
   * }
   * ```
   */
  async downloadVideo(url: string): Promise<TikTokDownloadResult> {
    try {
      const cleanUrl = this.cleanTikTokUrl(url);
      if (!this.isValidTikTokUrl(cleanUrl)) {
        return {
          success: false,
          message: 'Invalid TikTok URL provided',
          error: 'URL format is not recognized as a valid TikTok video URL'
        };
      }

      const videoId = this.extractVideoId(cleanUrl);
      if (!videoId) {
        return {
          success: false,
          message: 'Could not extract video ID from URL',
          error: 'Video ID extraction failed'
        };
      }

      const videoData = await this.fetchVideoData(cleanUrl);
      if (!videoData) {
        return {
          success: false,
          message: 'Failed to fetch video data',
          error: 'Could not retrieve video information from TikTok'
        };
      }

      const downloadUrls = await this.extractDownloadUrls(videoData);
      
      return {
        success: true,
        message: 'Video information retrieved successfully',
        data: {
          videoInfo: videoData,
          downloadUrls
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while processing the video',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cleans and normalizes a TikTok URL
   * @private
   * @param url - The raw TikTok URL to clean
   * @returns The cleaned and normalized URL
   */
  private cleanTikTokUrl(url: string): string {
    url = url.trim();
    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
      return url;
    }
    
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^/]+\/video\/\d+/);
    return match ? match[0] : url;
  }

  /**
   * Validates if a URL is a valid TikTok video URL
   * @private
   * @param url - The URL to validate
   * @returns True if the URL is a valid TikTok video URL
   */
  private isValidTikTokUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(?:www\.)?tiktok\.com\/@[^/]+\/video\/\d+/,
      /^https?:\/\/vm\.tiktok\.com\/[A-Za-z0-9]+/,
      /^https?:\/\/vt\.tiktok\.com\/[A-Za-z0-9]+/,
      /^https?:\/\/m\.tiktok\.com\/v\/\d+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extracts the video ID from a TikTok URL
   * @private
   * @param url - The TikTok URL to extract ID from
   * @returns The video ID or null if not found
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /\/video\/(\d+)/,
      /\/v\/(\d+)/,
      /video_id=(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Fetches video data from TikTok by scraping the video page
   * @private
   * @param url - The TikTok video URL to fetch data from
   * @returns Promise resolving to video information or null if failed
   */
  private async fetchVideoData(url: string): Promise<TikTokVideoInfo | null> {
    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: this.options.timeout
      });

      const $ = cheerio.load(response.data);
      
      const scriptTag = $('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').html();
      if (!scriptTag) {
        throw new Error('Could not find video data in page');
      }

      const jsonData = JSON.parse(scriptTag);
      const videoData = jsonData.__DEFAULT_SCOPE__['webapp.video-detail'];
      
      if (!videoData || !videoData.itemInfo) {
        throw new Error('Video data structure is invalid');
      }

      const item = videoData.itemInfo.itemStruct;
      const stats = item.stats;
      const music = item.music;
      const video = item.video;

      const videoInfo: TikTokVideoInfo = {
        id: item.id,
        title: item.desc || '',
        description: item.desc || '',
        duration: video.duration,
        playCount: stats.playCount || 0,
        likeCount: stats.diggCount || 0,
        commentCount: stats.commentCount || 0,
        shareCount: stats.shareCount || 0,
        createTime: item.createTime,
        videoUrl: video.playAddr,
        coverUrl: video.cover,
        dynamicCoverUrl: video.dynamicCover,
        music: {
          id: music.id,
          title: music.title,
          author: music.authorName,
          duration: music.duration,
          url: music.playUrl
        }
      };

      return videoInfo;
    } catch (error) {
      console.error('Error fetching video data:', error);
      return null;
    }
  }

  /**
   * Extracts download URLs from video information
   * @private
   * @param videoInfo - The video information object
   * @returns Promise resolving to download URLs object
   */
  private async extractDownloadUrls(videoInfo: TikTokVideoInfo): Promise<{ video: string; audio?: string; watermarkFree?: string }> {
    try {
      const downloadUrls: { video: string; audio?: string; watermarkFree?: string } = {
        video: videoInfo.videoUrl,
        audio: videoInfo.music.url
      };

      if (!this.options.includeWatermark) {
        const watermarkFreeUrl = await this.getWatermarkFreeUrl(videoInfo.id);
        if (watermarkFreeUrl) {
          downloadUrls.watermarkFree = watermarkFreeUrl;
        }
      }

      return downloadUrls;
    } catch (error) {
      return {
        video: videoInfo.videoUrl,
        audio: videoInfo.music.url
      };
    }
  }

  /**
   * Attempts to get a watermark-free download URL using external API
   * @private
   * @param videoId - The TikTok video ID
   * @returns Promise resolving to watermark-free URL or null if not available
   */
  private async getWatermarkFreeUrl(videoId: string): Promise<string | null> {
    try {
      const apiUrl = `https://api.tiklydown.eu.org/api/download?url=https://www.tiktok.com/@user/video/${videoId}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: this.options.timeout
      });

      if (response.data && response.data.video && response.data.video.noWatermark) {
        return response.data.video.noWatermark;
      }

      return null;
    } catch (error) {
      console.error('Error getting watermark-free URL:', error);
      return null;
    }
  }


}