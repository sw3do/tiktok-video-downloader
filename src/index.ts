/**
 * @fileoverview TikTok Video Downloader - A powerful TypeScript module for downloading TikTok videos
 * @author sw3do
 * @version 1.0.0
 */

import { TikTokDownloader } from './TikTokDownloader';
import { TikTokDownloaderOptions } from './types';

export { TikTokDownloader } from './TikTokDownloader';
export {
  TikTokVideoInfo,
  TikTokDownloadResult,
  TikTokDownloaderOptions
} from './types';

/**
 * Factory function to create a new TikTokDownloader instance
 * @param options - Configuration options for the downloader
 * @returns A new TikTokDownloader instance
 * @example
 * ```typescript
 * const downloader = createTikTokDownloader({
 *   includeWatermark: false,
 *   quality: 'high'
 * });
 * ```
 */
export const createTikTokDownloader = (options?: TikTokDownloaderOptions) => {
  return new TikTokDownloader(options);
};

export default TikTokDownloader;