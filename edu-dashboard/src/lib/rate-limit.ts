interface RateLimitRecord {
    count: number;
    resetAt: number;
  }
  
  // Map to store rate limit records by IP address
  const rateLimitMap = new Map<string, RateLimitRecord>();
  
  /**
   * Checks if the given IP has exceeded rate limits
   * Allows 5 requests per 24 hours
   */
  export async function checkRateLimit(ip: string): Promise<boolean> {
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const maxRequests = 5;
    
    // Clean up expired records occasionally
    if (Math.random() < 0.1) { // 10% chance to run cleanup
      cleanupExpiredRecords();
    }
  
    // Get or create rate limit record for this IP
    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
    
    // Check if window has expired and reset if needed
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }
    
    // Check if rate limit is exceeded
    if (record.count >= maxRequests) {
      return false;
    }
    
    // Increment count and update the record
    record.count += 1;
    rateLimitMap.set(ip, record);
    
    return true;
  }
  
  /**
   * Cleans up expired rate limit records to prevent memory leaks
   */
  function cleanupExpiredRecords() {
    const now = Date.now();
    
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }