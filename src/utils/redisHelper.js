import redisClient from "../config/redis.js";

/**
 * Redis Utility Helper
 * Provides a clean interface for common Redis operations
 */
const RedisHelper = {
    /**
     * Store data in Redis with an optional expiration time
     * @param {string} key - The key to store the data under
     * @param {any} value - The data to store (will be stringified if it's an object)
     * @param {number} [ttlSeconds] - Optional Time To Live in seconds
     * @returns {Promise<string>} - 'OK' if successful
     */
    setData: async (key, value, ttlSeconds = null) => {
        try {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            
            if (ttlSeconds) {
                return await redisClient.set(key, stringValue, {
                    EX: ttlSeconds
                });
            } else {
                return await redisClient.set(key, stringValue);
            }
        } catch (error) {
            console.error(`Redis Set Error [Key: ${key}]:`, error);
            throw error;
        }
    },

    /**
     * Retrieve data from Redis
     * @param {string} key - The key to retrieve
     * @param {boolean} [isObject=false] - Whether the data should be parsed as JSON
     * @returns {Promise<any|null>} - The retrieved data or null if not found
     */
    getData: async (key, isObject = false) => {
        try {
            const value = await redisClient.get(key);
            if (!value) return null;
            
            return isObject ? JSON.parse(value) : value;
        } catch (error) {
            console.error(`Redis Get Error [Key: ${key}]:`, error);
            throw error;
        }
    },

    /**
     * Delete data from Redis
     * @param {string} key - The key to delete
     * @returns {Promise<number>} - 1 if deleted, 0 if not found
     */
    deleteData: async (key) => {
        try {
            return await redisClient.del(key);
        } catch (error) {
            console.error(`Redis Delete Error [Key: ${key}]:`, error);
            throw error;
        }
    }
};

export default RedisHelper;
