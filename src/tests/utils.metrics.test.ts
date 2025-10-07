import { describe, it, expect, beforeEach, vi } from 'vitest'
import { metricsTracker } from '../utils/metrics'

describe('MetricsTracker', () => {
  beforeEach(() => {
    // Reset the metrics tracker before each test
    // Since it's a singleton, we need to manually reset its internal state
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('recordRequest', () => {
    it('should record a new request', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      metricsTracker.recordRequest()
      const total = metricsTracker.getTotalRequests()

      expect(total).toBeGreaterThanOrEqual(1)
    })

    it('should record multiple requests', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const initialTotal = metricsTracker.getTotalRequests()

      metricsTracker.recordRequest()
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      const total = metricsTracker.getTotalRequests()
      expect(total).toBe(initialTotal + 3)
    })
  })

  describe('getRequestsPerSecond', () => {
    it('should return 0 when no requests recorded', () => {
      // Create a fresh test by advancing time beyond window
      vi.setSystemTime(Date.now() + 20000)
      metricsTracker.recordRequest() // This will trigger cleanup

      vi.advanceTimersByTime(20000) // Move past window
      const rps = metricsTracker.getRequestsPerSecond()

      expect(rps).toBe(0)
    })

    it('should calculate RPS for recent requests', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      // Record 5 requests in the last second
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      const rps = metricsTracker.getRequestsPerSecond()
      expect(rps).toBeGreaterThanOrEqual(5)
    })

    it('should not count old requests in RPS', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      // Record requests
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      // Advance time by 2 seconds
      vi.advanceTimersByTime(2000)

      // Old requests should not be counted
      const rps = metricsTracker.getRequestsPerSecond()
      expect(rps).toBe(0)
    })
  })

  describe('getTotalRequests', () => {
    it('should return total requests in window', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const initialTotal = metricsTracker.getTotalRequests()

      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      const total = metricsTracker.getTotalRequests()
      expect(total).toBe(initialTotal + 2)
    })

    it('should clean up old requests outside window', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      // Advance time beyond window (10 seconds)
      vi.advanceTimersByTime(11000)
      metricsTracker.recordRequest() // Trigger cleanup

      const total = metricsTracker.getTotalRequests()
      expect(total).toBe(1) // Only the last request
    })
  })

  describe('getAverageRPS', () => {
    it('should return 0 when no requests recorded', () => {
      // Move past window to clear old requests
      vi.setSystemTime(Date.now() + 20000)
      metricsTracker.recordRequest()

      vi.advanceTimersByTime(20000)
      const avgRps = metricsTracker.getAverageRPS()

      expect(avgRps).toBe(0)
    })

    it('should calculate average RPS over window', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      // Record 10 requests
      for (let i = 0; i < 10; i++) {
        metricsTracker.recordRequest()
      }

      const avgRps = metricsTracker.getAverageRPS()

      // With a 10-second window and 10 requests, average should be 1 RPS
      expect(avgRps).toBeGreaterThanOrEqual(1)
    })

    it('should update as time passes', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      // Record requests
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      const avgRps1 = metricsTracker.getAverageRPS()

      // Advance time
      vi.advanceTimersByTime(5000)

      // Record more requests
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      const avgRps2 = metricsTracker.getAverageRPS()

      // Average should be based on all requests in window
      expect(avgRps2).toBeGreaterThan(0)
    })
  })

  describe('cleanup', () => {
    it('should remove requests outside the time window', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      // First, cleanup any existing requests
      vi.advanceTimersByTime(20000)
      metricsTracker.recordRequest()
      vi.advanceTimersByTime(20000)

      // Now start fresh
      const cleanStart = Date.now()
      vi.setSystemTime(cleanStart)

      // Record requests
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      const before = metricsTracker.getTotalRequests()

      // Advance time beyond the 10-second window
      vi.advanceTimersByTime(11000)

      // Record a new request to trigger cleanup
      metricsTracker.recordRequest()

      const after = metricsTracker.getTotalRequests()

      // Should only have the most recent request
      expect(after).toBeLessThan(before)
      expect(after).toBe(1)
    })

    it('should maintain recent requests within window', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      metricsTracker.recordRequest()
      metricsTracker.recordRequest()

      // Advance time but stay within window
      vi.advanceTimersByTime(5000)

      metricsTracker.recordRequest()

      const total = metricsTracker.getTotalRequests()

      // All requests should still be in window
      expect(total).toBeGreaterThanOrEqual(3)
    })
  })
})
