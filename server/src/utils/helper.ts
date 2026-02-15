export const tokenBlacklist: Map<string, number> = new Map();
const cleanupBlacklist = () => {
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000; // One day in milliseconds

  for (const [token, timestamp] of tokenBlacklist.entries()) {
    if (now - timestamp > oneDayInMs) {
      tokenBlacklist.delete(token); // Remove token from blacklist
    }
  }
};
setInterval(cleanupBlacklist, 60 * 60 * 1000); //one Day

export const addToBlacklist = (token: string) => {
  const timestamp = Date.now(); // Store the current timestamp
  tokenBlacklist.set(token, timestamp);
};