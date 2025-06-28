import { D1Database } from '@cloudflare/workers-types'

export interface Webhook {
  id: string
  name: string
  url: string
  secret?: string
  events: string[]
  is_active: boolean
  retry_count: number
  timeout_seconds: number
  last_success_at?: string
  last_failure_at?: string
  failure_count: number
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event_type: string
  payload: any
  response_status?: number
  response_body?: string
  attempt_count: number
  delivered_at: string
}

export class WebhookService {
  constructor(private db: D1Database) {}

  async createWebhook(
    name: string,
    url: string,
    events: string[],
    secret?: string,
    retryCount: number = 3,
    timeoutSeconds: number = 30
  ): Promise<string> {
    const webhookId = globalThis.crypto.randomUUID()
    
    await this.db.prepare(`
      INSERT INTO webhooks 
      (id, name, url, secret, events, is_active, retry_count, timeout_seconds)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      webhookId,
      name,
      url,
      secret,
      JSON.stringify(events),
      retryCount,
      timeoutSeconds
    ).run()

    return webhookId
  }

  async getWebhooks(activeOnly: boolean = false): Promise<Webhook[]> {
    const whereClause = activeOnly ? 'WHERE is_active = 1' : ''
    
    const { results } = await this.db.prepare(`
      SELECT * FROM webhooks 
      ${whereClause}
      ORDER BY created_at DESC
    `).all()

    return results.map(row => ({
      ...row,
      events: JSON.parse(row.events),
      is_active: Boolean(row.is_active)
    })) as Webhook[]
  }

  async getWebhook(webhookId: string): Promise<Webhook | null> {
    const webhook = await this.db.prepare(`
      SELECT * FROM webhooks WHERE id = ?
    `).bind(webhookId).first()

    if (!webhook) return null

    return {
      ...webhook,
      events: JSON.parse(webhook.events),
      is_active: Boolean(webhook.is_active)
    } as Webhook
  }

  async updateWebhook(
    webhookId: string,
    updates: Partial<Webhook>
  ): Promise<boolean> {
    try {
      const fields = []
      const values = []

      if (updates.name !== undefined) {
        fields.push('name = ?')
        values.push(updates.name)
      }
      if (updates.url !== undefined) {
        fields.push('url = ?')
        values.push(updates.url)
      }
      if (updates.secret !== undefined) {
        fields.push('secret = ?')
        values.push(updates.secret)
      }
      if (updates.events !== undefined) {
        fields.push('events = ?')
        values.push(JSON.stringify(updates.events))
      }
      if (updates.is_active !== undefined) {
        fields.push('is_active = ?')
        values.push(updates.is_active ? 1 : 0)
      }
      if (updates.retry_count !== undefined) {
        fields.push('retry_count = ?')
        values.push(updates.retry_count)
      }
      if (updates.timeout_seconds !== undefined) {
        fields.push('timeout_seconds = ?')
        values.push(updates.timeout_seconds)
      }

      if (fields.length === 0) return false

      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(webhookId)

      await this.db.prepare(`
        UPDATE webhooks 
        SET ${fields.join(', ')}
        WHERE id = ?
      `).bind(...values).run()

      return true
    } catch (error) {
      console.error('Failed to update webhook:', error)
      return false
    }
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        DELETE FROM webhooks WHERE id = ?
      `).bind(webhookId).run()

      return result.changes > 0
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      return false
    }
  }

  async triggerWebhooks(eventType: string, payload: any): Promise<void> {
    const webhooks = await this.getWebhooksForEvent(eventType)
    
    for (const webhook of webhooks) {
      // In production, this would be queued for background processing
      this.deliverWebhook(webhook, eventType, payload).catch(error => {
        console.error(`Webhook delivery failed for ${webhook.id}:`, error)
      })
    }
  }

  private async getWebhooksForEvent(eventType: string): Promise<Webhook[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM webhooks 
      WHERE is_active = 1 
      AND json_extract(events, '$') LIKE '%"${eventType}"%'
    `).all()

    return results.map(row => ({
      ...row,
      events: JSON.parse(row.events),
      is_active: Boolean(row.is_active)
    })) as Webhook[]
  }

  private async deliverWebhook(
    webhook: Webhook,
    eventType: string,
    payload: any,
    attemptCount: number = 1
  ): Promise<boolean> {
    const deliveryId = globalThis.crypto.randomUUID()
    const timestamp = new Date().toISOString()
    
    const webhookPayload = {
      id: deliveryId,
      event: eventType,
      timestamp,
      data: payload,
      webhook_id: webhook.id
    }

    try {
      // Create delivery record
      await this.db.prepare(`
        INSERT INTO webhook_deliveries 
        (id, webhook_id, event_type, payload, attempt_count)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        deliveryId,
        webhook.id,
        eventType,
        JSON.stringify(webhookPayload),
        attemptCount
      ).run()

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'SonicJS-Webhooks/1.0',
        'X-SonicJS-Event': eventType,
        'X-SonicJS-Delivery': deliveryId,
        'X-SonicJS-Timestamp': timestamp
      }

      // Add signature if secret is provided
      if (webhook.secret) {
        const signature = await this.createSignature(JSON.stringify(webhookPayload), webhook.secret)
        headers['X-SonicJS-Signature'] = signature
      }

      // Make the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000)

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseBody = await response.text()

      // Update delivery record
      await this.db.prepare(`
        UPDATE webhook_deliveries 
        SET response_status = ?, response_body = ?
        WHERE id = ?
      `).bind(response.status, responseBody, deliveryId).run()

      if (response.ok) {
        // Update webhook success
        await this.db.prepare(`
          UPDATE webhooks 
          SET last_success_at = CURRENT_TIMESTAMP, failure_count = 0
          WHERE id = ?
        `).bind(webhook.id).run()

        return true
      } else {
        throw new Error(`HTTP ${response.status}: ${responseBody}`)
      }

    } catch (error) {
      console.error(`Webhook delivery failed (attempt ${attemptCount}):`, error)

      // Update delivery record with error
      await this.db.prepare(`
        UPDATE webhook_deliveries 
        SET response_status = ?, response_body = ?
        WHERE id = ?
      `).bind(0, error.message, deliveryId).run()

      // Update webhook failure
      await this.db.prepare(`
        UPDATE webhooks 
        SET last_failure_at = CURRENT_TIMESTAMP, failure_count = failure_count + 1
        WHERE id = ?
      `).bind(webhook.id).run()

      // Retry if under retry limit
      if (attemptCount < webhook.retry_count) {
        // Exponential backoff: wait 2^attemptCount seconds
        const delayMs = Math.pow(2, attemptCount) * 1000
        setTimeout(() => {
          this.deliverWebhook(webhook, eventType, payload, attemptCount + 1)
        }, delayMs)
      }

      return false
    }
  }

  private async createSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const key = encoder.encode(secret)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return `sha256=${hashHex}`
  }

  async getWebhookDeliveries(
    webhookId?: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    const whereClause = webhookId ? 'WHERE webhook_id = ?' : ''
    const params = webhookId ? [webhookId, limit] : [limit]

    const { results } = await this.db.prepare(`
      SELECT * FROM webhook_deliveries 
      ${whereClause}
      ORDER BY delivered_at DESC
      LIMIT ?
    `).bind(...params).all()

    return results.map(row => ({
      ...row,
      payload: JSON.parse(row.payload)
    })) as WebhookDelivery[]
  }

  async retryWebhookDelivery(deliveryId: string): Promise<boolean> {
    try {
      const delivery = await this.db.prepare(`
        SELECT wd.*, w.* FROM webhook_deliveries wd
        JOIN webhooks w ON wd.webhook_id = w.id
        WHERE wd.id = ?
      `).bind(deliveryId).first()

      if (!delivery) return false

      const webhook: Webhook = {
        id: delivery.webhook_id,
        name: delivery.name,
        url: delivery.url,
        secret: delivery.secret,
        events: JSON.parse(delivery.events),
        is_active: Boolean(delivery.is_active),
        retry_count: delivery.retry_count,
        timeout_seconds: delivery.timeout_seconds,
        last_success_at: delivery.last_success_at,
        last_failure_at: delivery.last_failure_at,
        failure_count: delivery.failure_count
      }

      const payload = JSON.parse(delivery.payload)
      
      return await this.deliverWebhook(
        webhook,
        delivery.event_type,
        payload.data,
        delivery.attempt_count + 1
      )
    } catch (error) {
      console.error('Failed to retry webhook delivery:', error)
      return false
    }
  }

  async getWebhookStats(webhookId?: string): Promise<{
    total_deliveries: number
    successful_deliveries: number
    failed_deliveries: number
    average_response_time: number
  }> {
    const whereClause = webhookId ? 'WHERE webhook_id = ?' : ''
    const params = webhookId ? [webhookId] : []

    const stats = await this.db.prepare(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN response_status >= 200 AND response_status < 300 THEN 1 ELSE 0 END) as successful_deliveries,
        SUM(CASE WHEN response_status < 200 OR response_status >= 300 THEN 1 ELSE 0 END) as failed_deliveries
      FROM webhook_deliveries 
      ${whereClause}
    `).bind(...params).first()

    return {
      total_deliveries: stats?.total_deliveries || 0,
      successful_deliveries: stats?.successful_deliveries || 0,
      failed_deliveries: stats?.failed_deliveries || 0,
      average_response_time: 0 // Would need to track timing for this
    }
  }

  // Predefined webhook events
  async triggerContentCreated(contentId: string, content: any): Promise<void> {
    await this.triggerWebhooks('content.created', {
      id: contentId,
      ...content,
      action: 'created'
    })
  }

  async triggerContentUpdated(contentId: string, content: any, changes: any): Promise<void> {
    await this.triggerWebhooks('content.updated', {
      id: contentId,
      ...content,
      changes,
      action: 'updated'
    })
  }

  async triggerContentPublished(contentId: string, content: any): Promise<void> {
    await this.triggerWebhooks('content.published', {
      id: contentId,
      ...content,
      action: 'published'
    })
  }

  async triggerWorkflowTransition(contentId: string, fromState: string, toState: string): Promise<void> {
    await this.triggerWebhooks('workflow.transition', {
      content_id: contentId,
      from_state: fromState,
      to_state: toState,
      action: 'workflow_transition'
    })
  }

  async triggerUserCreated(userId: string, user: any): Promise<void> {
    await this.triggerWebhooks('user.created', {
      id: userId,
      ...user,
      action: 'created'
    })
  }

  // Clean up old deliveries
  async cleanupOldDeliveries(daysToKeep: number = 30): Promise<number> {
    const result = await this.db.prepare(`
      DELETE FROM webhook_deliveries 
      WHERE delivered_at < datetime('now', '-${daysToKeep} days')
    `).run()

    return result.changes
  }
}