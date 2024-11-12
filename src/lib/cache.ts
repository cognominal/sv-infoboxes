import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type CacheEntry<T> = { title: string; content: T; timestamp: number };
export type Cache<T> = Map<string, CacheEntry<T>>

export function createTimedCache<T>(): Cache<T> {
    const cache = new Map<string, CacheEntry<T>>();

    function purgeOldCacheEntries() {
        const oneHourAgo = Date.now() - 60 * 60 * 1000; // One hour in milliseconds

        for (const [key, entry] of cache.entries()) {
            if (entry.timestamp < oneHourAgo) {
                cache.delete(key);
            }
        }
    }

    // Set up a timer to purge old entries every hour
    setInterval(purgeOldCacheEntries, 60 * 60 * 1000); // 1 hour in milliseconds

    return cache;
}

// Usage
// const cache = createTimedCache<string>();

export type FileCacheEntry<T> = { title: string; content: T; timestamp: number };

const CACHE_DIRECTORY = path.resolve(__dirname, 'file_cache_entries');

// Ensure the cache directory exists
if (!fs.existsSync(CACHE_DIRECTORY)) {
    fs.mkdirSync(CACHE_DIRECTORY);
}

function getFilePath(key: string): string {
    return path.join(CACHE_DIRECTORY, `cache_${key}.json`);
}

export function createFileCache<T>(liveDuration: number = 60 * 60 * 1000) {
    // In-memory map to store only timestamps
    const timestamps = new Map<string, number>();

    function setCacheEntry(key: string, entry: FileCacheEntry<T>) {
        const filePath = getFilePath(key);
        fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), 'utf-8');
        timestamps.set(key, entry.timestamp); // Update the timestamp in memory
    }

    function getCacheEntry(key: string): FileCacheEntry<T> | null {
        const filePath = getFilePath(key);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const entry = JSON.parse(data) as FileCacheEntry<T>;
            timestamps.set(key, entry.timestamp); // Ensure the timestamp is updated in memory
            return entry;
        }
        return null;
    }

    function deleteCacheEntry(key: string) {
        const filePath = getFilePath(key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        timestamps.delete(key); // Remove the timestamp from memory
    }

    function purgeOldCacheEntries() {
        const expiryTime = Date.now() - liveDuration;

        for (const [key, timestamp] of timestamps.entries()) {
            if (timestamp < expiryTime) {
                deleteCacheEntry(key); // Only delete the file if timestamp is old
            }
        }
    }

    // Set up a timer to purge old entries based on the specified duration
    setInterval(purgeOldCacheEntries, liveDuration);

    return {
        set(key: string, value: FileCacheEntry<T>) {
            setCacheEntry(key, value);
        },
        get(key: string): FileCacheEntry<T> | null {
            return getCacheEntry(key);
        },
        delete(key: string) {
            deleteCacheEntry(key);
        }
    };
}