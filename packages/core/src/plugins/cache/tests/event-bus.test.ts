/**
 * Event Bus Tests
 *
 * Tests for the centralized event system used for cache invalidation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getEventBus, emitEvent, onEvent, EventHandler } from '../services/event-bus.js'

describe('EventBus', () => {
  let eventBus: ReturnType<typeof getEventBus>

  beforeEach(() => {
    // Get a fresh event bus and clear its state
    eventBus = getEventBus()
    // Clear all subscriptions by unsubscribing from known events
    for (const event of eventBus.getEvents()) {
      eventBus.off(event)
    }
    eventBus.clearEventLog()
  })

  describe('Subscription Management', () => {
    it('should subscribe to an event', () => {
      const handler = vi.fn()
      eventBus.on('test.event', handler)

      expect(eventBus.getEvents()).toContain('test.event')
      expect(eventBus.getSubscriberCount('test.event')).toBe(1)
    })

    it('should allow multiple subscribers for the same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      eventBus.on('test.event', handler1)
      eventBus.on('test.event', handler2)
      eventBus.on('test.event', handler3)

      expect(eventBus.getSubscriberCount('test.event')).toBe(3)
    })

    it('should return an unsubscribe function', () => {
      const handler = vi.fn()
      const unsubscribe = eventBus.on('test.event', handler)

      expect(typeof unsubscribe).toBe('function')
      expect(eventBus.getSubscriberCount('test.event')).toBe(1)

      unsubscribe()

      expect(eventBus.getSubscriberCount('test.event')).toBe(0)
    })

    it('should only unsubscribe the specific handler', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const unsubscribe1 = eventBus.on('test.event', handler1)
      eventBus.on('test.event', handler2)

      unsubscribe1()

      expect(eventBus.getSubscriberCount('test.event')).toBe(1)
    })

    it('should handle unsubscribe when event has no handlers', () => {
      const handler = vi.fn()
      const unsubscribe = eventBus.on('test.event', handler)

      // Remove all handlers for the event
      eventBus.off('test.event')

      // Unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow()
    })

    it('should remove all subscribers with off()', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('test.event', handler1)
      eventBus.on('test.event', handler2)

      eventBus.off('test.event')

      expect(eventBus.getSubscriberCount('test.event')).toBe(0)
      expect(eventBus.getEvents()).not.toContain('test.event')
    })

    it('should return 0 for subscriber count of non-existent event', () => {
      expect(eventBus.getSubscriberCount('non.existent')).toBe(0)
    })
  })

  describe('Event Emission', () => {
    it('should emit event to all subscribers', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('test.event', handler1)
      eventBus.on('test.event', handler2)

      await eventBus.emit('test.event')

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should pass data to event handlers', async () => {
      const handler = vi.fn()
      const testData = { id: '123', name: 'test' }

      eventBus.on('test.event', handler)
      await eventBus.emit('test.event', testData)

      expect(handler).toHaveBeenCalledWith(testData)
    })

    it('should handle events with no subscribers', async () => {
      // Should not throw
      await expect(eventBus.emit('no.subscribers')).resolves.not.toThrow()
    })

    it('should call async handlers correctly', async () => {
      const results: number[] = []
      const handler1: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        results.push(1)
      }
      const handler2: EventHandler = async () => {
        results.push(2)
      }

      eventBus.on('test.event', handler1)
      eventBus.on('test.event', handler2)

      await eventBus.emit('test.event')

      expect(results).toContain(1)
      expect(results).toContain(2)
    })

    it('should handle handler errors gracefully', async () => {
      const errorHandler = vi.fn().mockRejectedValue(new Error('Handler error'))
      const successHandler = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      eventBus.on('test.event', errorHandler)
      eventBus.on('test.event', successHandler)

      // Should not throw
      await expect(eventBus.emit('test.event')).resolves.not.toThrow()

      // Success handler should still be called
      expect(successHandler).toHaveBeenCalled()

      // Error should be logged
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should emit to wildcard subscribers', async () => {
      const wildcardHandler = vi.fn()
      const specificHandler = vi.fn()

      eventBus.on('*', wildcardHandler)
      eventBus.on('specific.event', specificHandler)

      await eventBus.emit('specific.event', { data: 'test' })

      expect(specificHandler).toHaveBeenCalledWith({ data: 'test' })
      expect(wildcardHandler).toHaveBeenCalledWith({
        event: 'specific.event',
        data: { data: 'test' }
      })
    })

    it('should handle wildcard handler errors gracefully', async () => {
      const errorWildcardHandler = vi.fn().mockRejectedValue(new Error('Wildcard error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      eventBus.on('*', errorWildcardHandler)

      await expect(eventBus.emit('test.event')).resolves.not.toThrow()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Event Logging', () => {
    it('should log emitted events', async () => {
      await eventBus.emit('test.event', { id: 1 })
      await eventBus.emit('another.event', { id: 2 })

      const log = eventBus.getEventLog()

      expect(log.length).toBe(2)
      expect(log[0].event).toBe('test.event')
      expect(log[0].data).toEqual({ id: 1 })
      expect(log[1].event).toBe('another.event')
      expect(log[1].data).toEqual({ id: 2 })
    })

    it('should include timestamp in event log', async () => {
      const beforeTime = Date.now()
      await eventBus.emit('test.event')
      const afterTime = Date.now()

      const log = eventBus.getEventLog()

      expect(log[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(log[0].timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should limit event log entries with getEventLog limit parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await eventBus.emit('test.event', { index: i })
      }

      const limitedLog = eventBus.getEventLog(5)

      expect(limitedLog.length).toBe(5)
      // Should return the last 5 events
      expect(limitedLog[0].data.index).toBe(5)
      expect(limitedLog[4].data.index).toBe(9)
    })

    it('should clear event log', async () => {
      await eventBus.emit('test.event')
      await eventBus.emit('another.event')

      eventBus.clearEventLog()

      const log = eventBus.getEventLog()
      expect(log.length).toBe(0)
    })

    it('should maintain max log size (100 entries)', async () => {
      // Emit more than 100 events
      for (let i = 0; i < 110; i++) {
        await eventBus.emit('test.event', { index: i })
      }

      const log = eventBus.getEventLog(200) // Request more than max

      expect(log.length).toBe(100) // Should be capped at maxLogSize
      // First event should be index 10 (0-9 were shifted out)
      expect(log[0].data.index).toBe(10)
    })
  })

  describe('Statistics', () => {
    it('should return correct statistics', async () => {
      eventBus.on('event.a', vi.fn())
      eventBus.on('event.b', vi.fn())
      eventBus.on('event.b', vi.fn())

      await eventBus.emit('event.a', { id: 1 })
      await eventBus.emit('event.a', { id: 2 })
      await eventBus.emit('event.b', { id: 3 })

      const stats = eventBus.getStats()

      expect(stats.totalEvents).toBe(3)
      expect(stats.totalSubscriptions).toBe(2) // 2 unique events
      expect(stats.eventCounts['event.a']).toBe(2)
      expect(stats.eventCounts['event.b']).toBe(1)
    })

    it('should return empty stats when no events emitted', () => {
      const stats = eventBus.getStats()

      expect(stats.totalEvents).toBe(0)
      expect(stats.totalSubscriptions).toBe(0)
      expect(stats.eventCounts).toEqual({})
    })
  })
})

describe('Convenience Functions', () => {
  beforeEach(() => {
    const eventBus = getEventBus()
    for (const event of eventBus.getEvents()) {
      eventBus.off(event)
    }
    eventBus.clearEventLog()
  })

  describe('getEventBus', () => {
    it('should return singleton instance', () => {
      const bus1 = getEventBus()
      const bus2 = getEventBus()

      expect(bus1).toBe(bus2)
    })
  })

  describe('emitEvent', () => {
    it('should emit event through global event bus', async () => {
      const handler = vi.fn()
      onEvent('test.event', handler)

      await emitEvent('test.event', { data: 'test' })

      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })
  })

  describe('onEvent', () => {
    it('should subscribe through global event bus', async () => {
      const handler = vi.fn()
      const unsubscribe = onEvent('test.event', handler)

      await emitEvent('test.event')

      expect(handler).toHaveBeenCalled()

      // Clean up
      unsubscribe()
    })

    it('should return unsubscribe function', async () => {
      const handler = vi.fn()
      const unsubscribe = onEvent('test.event', handler)

      unsubscribe()

      await emitEvent('test.event')

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
