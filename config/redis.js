import { createClient } from "redis";

// Initialize the client
// By default, this connects to localhost:6379
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Event listeners for monitoring connection status
redisClient.on('connect', () => console.log('Redis Client Connecting...'));
redisClient.on('ready', () => console.log('Redis Client Ready!'));
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('end', () => console.log('Redis Client Disconnected'));

// Immediately-Invoked Function Expression (IIFE) to connect asynchronously
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Could not establish a connection with Redis:', err);
  }
})();

export default redisClient
