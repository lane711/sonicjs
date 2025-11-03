/**
 * Event Bus for Cache Invalidation
 *
 * Provides a centralized event system for triggering cache invalidation
 * based on application events.
 */

export type EventHandler = (data?: any) => Promise<void> | void

// interface EventSubscription {
//   event: string
//   handler: EventHandler
// }

class EventBus {
  private subscriptions: Map<string, EventHandler[]> = new Map()
  private eventLog: Array<{ event: string; timestamp: number; data?: any }> = []
  private maxLogSize: number = 100

  /**
   * Subscribe to an event
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, [])
    }

    this.subscriptions.get(event)!.push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(event)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  async emit(event: string, data?: any): Promise<void> {
    // Log the event
    this.logEvent(event, data)

    const handlers = this.subscriptions.get(event) || []

    // Execute all handlers
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    )

    // Also emit to wildcard subscribers
    const wildcardHandlers = this.subscriptions.get('*') || []
    await Promise.all(
      wildcardHandlers.map(async (handler) => {
        try {
          await handler({ event, data })
        } catch (error) {
          console.error(`Error in wildcard event handler for ${event}:`, error)
        }
      })
    )
  }

  /**
   * Remove all subscribers for an event
   */
  off(event: string): void {
    this.subscriptions.delete(event)
  }

  /**
   * Get all registered events
   */
  getEvents(): string[] {
    return Array.from(this.subscriptions.keys())
  }

  /**
   * Get subscriber count for an event
   */
  getSubscriberCount(event: string): number {
    return this.subscriptions.get(event)?.length || 0
  }

  /**
   * Log an event for debugging
   */
  private logEvent(event: string, data?: any): void {
    this.eventLog.push({
      event,
      timestamp: Date.now(),
      data
    })

    // Keep log size manageable
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift()
    }
  }

  /**
   * Get recent event log
   */
  getEventLog(limit: number = 50): Array<{ event: string; timestamp: number; data?: any }> {
    return this.eventLog.slice(-limit)
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = []
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEvents: number
    totalSubscriptions: number
    eventCounts: Record<string, number>
  } {
    const eventCounts: Record<string, number> = {}

    for (const log of this.eventLog) {
      eventCounts[log.event] = (eventCounts[log.event] || 0) + 1
    }

    return {
      totalEvents: this.eventLog.length,
      totalSubscriptions: this.subscriptions.size,
      eventCounts
    }
  }
}

// Global event bus instance
let globalEventBus: EventBus | null = null

/**
 * Get or create the global event bus
 */
export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus()
  }
  return globalEventBus
}

/**
 * Convenience function to emit an event
 */
export async function emitEvent(event: string, data?: any): Promise<void> {
  const bus = getEventBus()
  await bus.emit(event, data)
}

/**
 * Convenience function to subscribe to an event
 */
export function onEvent(event: string, handler: EventHandler): () => void {
  const bus = getEventBus()
  return bus.on(event, handler)
}
