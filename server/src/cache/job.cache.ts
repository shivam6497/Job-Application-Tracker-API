import redisClient from "../config/redis.js";

const TTL = {
    SINGLE_JOB: 60 *60,
    JOB_LIST: 60 * 5,
} as const;

export const cacheKeys = {
    job: (id: string) => `job:${id}`,
    jobList: (page: number, limit: number) => `job:list:${page}:${limit}`,
    jobListPrefix: () => `job:list:*`,
} as const;

export async function getCachedJob<T>(id: string): Promise<T | null>{
    try {
        const cachedData = await redisClient.get(cacheKeys.job(id));
        if(!cachedData) return null;
        return JSON.parse(cachedData) as T;
    } catch (error) {
        console.error(`Error getting cached job with id ${id}:`, error);
        return null;
    }
}

export async function setCachedJob<T>(id: string, data: T): Promise<void> {
    try {
        await redisClient.setex(cacheKeys.job(id), TTL.SINGLE_JOB, JSON.stringify(data));
    } catch (error) {
        console.error(`Error setting cached job with id ${id}:`, error);
    }
}

export async function getCachedJobList<T>(page: number, limit: number): Promise<T | null> {
    try {
        const cachedData = await redisClient.get(cacheKeys.jobList(page, limit));
        if(!cachedData) return null;
        return JSON.parse(cachedData) as T;
    } catch (error) {
        console.error(`Error getting cached job list with page ${page} and limit ${limit}:`, error);
        return null;
    }
}

export async function setCachedJobList<T>(page: number, limit: number, data: T): Promise<void> {
    try {
        await redisClient.setex(cacheKeys.jobList(page, limit), TTL.JOB_LIST, JSON.stringify(data));
    } catch (error) {
        console.error(`Error setting cached job list with page ${page} and limit ${limit}:`, error);
    }
}

export async function invalidateJobCache(id: string): Promise<void> {
    try {
        await redisClient.del(cacheKeys.job(id));
    } catch (error) {
        console.error(`Error invalidating cached job with id ${id}:`, error);
    }
}

export async function invalidateJobListCache(): Promise<void> {
    try {
        const patterns = cacheKeys.jobListPrefix();
        const keysToDelete: string[] = [];

        let cursor = '0';

        do {
            const [newCursor, keys] = await redisClient.scan(cursor, 'MATCH', patterns, 'COUNT', 100);
            cursor = newCursor;
            keysToDelete.push(...keys);
        } while (cursor !== '0');

        if(keysToDelete.length === 0) {
            console.log('No job list cache keys found to invalidate.');
            return;
        }

        await redisClient.del(...keysToDelete);

    } catch (error) {
        console.error('Error invalidating cached job list:', error);
    }
}