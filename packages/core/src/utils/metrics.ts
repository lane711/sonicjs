/**
 * Simple in-memory metrics tracker for real-time analytics
 * Tracks requests per second using a sliding window
 */

interface RequestMetrics {
  timestamp: number
}

class MetricsTracker {
  private requests: RequestMetrics[] = []
  private readonly windowSize = 10000 // 10 seconds window

  /**
   * Record a new request
   */
  recordRequest(): void {
    const now = Date.now()
    this.requests.push({ timestamp: now })
    this.cleanup(now)
  }

  /**
   * Clean up old requests outside the window
   */
  private cleanup(now: number): void {
    const cutoff = now - this.windowSize
    this.requests = this.requests.filter(req => req.timestamp > cutoff)
  }

  /**
   * Get current requests per second
   */
  getRequestsPerSecond(): number {
    const now = Date.now()
    this.cleanup(now)

    if (this.requests.length === 0) {
      return 0
    }

    // Calculate RPS over the last second
    const oneSecondAgo = now - 1000
    const recentRequests = this.requests.filter(req => req.timestamp > oneSecondAgo)

    return recentRequests.length
  }

  /**
   * Get total requests in the current window
   */
  getTotalRequests(): number {
    const now = Date.now()
    this.cleanup(now)
    return this.requests.length
  }

  /**
   * Get average requests per second over the window
   */
  getAverageRPS(): number {
    const now = Date.now()
    this.cleanup(now)

    if (this.requests.length === 0) {
      return 0
    }

    const windowSeconds = this.windowSize / 1000
    return this.requests.length / windowSeconds
  }
}

// Global singleton instance
export const metricsTracker = new MetricsTracker()
