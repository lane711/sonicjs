import { EmailService, SendTemplatedEmailOptions, SendEmailOptions } from './email';

export interface EmailQueueJob {
  id: string;
  type: 'templated' | 'direct';
  priority: 'low' | 'normal' | 'high';
  scheduledAt?: number; // Unix timestamp
  maxRetries: number;
  attemptCount: number;
  data: SendTemplatedEmailOptions | SendEmailOptions;
  createdAt: number;
}

export interface EmailQueueService {
  enqueueTemplatedEmail(options: SendTemplatedEmailOptions & { priority?: 'low' | 'normal' | 'high'; scheduledAt?: Date }): Promise<string>;
  enqueueDirectEmail(options: SendEmailOptions & { priority?: 'low' | 'normal' | 'high'; scheduledAt?: Date }): Promise<string>;
  processQueue(): Promise<void>;
}

export class CloudflareEmailQueueService implements EmailQueueService {
  constructor(
    private emailService: EmailService,
    private queue: any // Cloudflare Queue binding
  ) {}

  async enqueueTemplatedEmail(
    options: SendTemplatedEmailOptions & { 
      priority?: 'low' | 'normal' | 'high'; 
      scheduledAt?: Date 
    }
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    const now = Date.now();

    const job: EmailQueueJob = {
      id: jobId,
      type: 'templated',
      priority: options.priority || 'normal',
      scheduledAt: options.scheduledAt ? options.scheduledAt.getTime() : undefined,
      maxRetries: 3,
      attemptCount: 0,
      data: {
        to: options.to,
        templateSlug: options.templateSlug,
        variables: options.variables,
        from: options.from,
        replyTo: options.replyTo,
        metadata: options.metadata,
      },
      createdAt: now,
    };

    // Add to Cloudflare Queue
    await this.queue.send(job, {
      delaySeconds: options.scheduledAt ? Math.max(0, Math.floor((options.scheduledAt.getTime() - now) / 1000)) : 0,
    });

    return jobId;
  }

  async enqueueDirectEmail(
    options: SendEmailOptions & { 
      priority?: 'low' | 'normal' | 'high'; 
      scheduledAt?: Date 
    }
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    const now = Date.now();

    const job: EmailQueueJob = {
      id: jobId,
      type: 'direct',
      priority: options.priority || 'normal',
      scheduledAt: options.scheduledAt ? options.scheduledAt.getTime() : undefined,
      maxRetries: 3,
      attemptCount: 0,
      data: {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from: options.from,
        replyTo: options.replyTo,
        metadata: options.metadata,
      },
      createdAt: now,
    };

    // Add to Cloudflare Queue
    await this.queue.send(job, {
      delaySeconds: options.scheduledAt ? Math.max(0, Math.floor((options.scheduledAt.getTime() - now) / 1000)) : 0,
    });

    return jobId;
  }

  async processQueue(): Promise<void> {
    // This method would be called by the Cloudflare Queue consumer
    // The actual processing happens in the queue consumer function
    throw new Error('processQueue should not be called directly. Use queue consumer instead.');
  }

  // Method to be used in the queue consumer
  async processJob(job: EmailQueueJob): Promise<{ success: boolean; error?: string; shouldRetry: boolean }> {
    try {
      job.attemptCount++;

      let result;
      if (job.type === 'templated') {
        result = await this.emailService.sendTemplatedEmail(job.data as SendTemplatedEmailOptions);
      } else {
        result = await this.emailService.sendEmail(job.data as SendEmailOptions);
      }

      if (result.success) {
        return { success: true, shouldRetry: false };
      } else {
        // Determine if we should retry based on the error
        const shouldRetry = this.shouldRetryJob(job, result.error);
        return { 
          success: false, 
          error: result.error, 
          shouldRetry: shouldRetry && job.attemptCount < job.maxRetries 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const shouldRetry = this.shouldRetryJob(job, errorMessage);
      
      return { 
        success: false, 
        error: errorMessage, 
        shouldRetry: shouldRetry && job.attemptCount < job.maxRetries 
      };
    }
  }

  private shouldRetryJob(_job: EmailQueueJob, error?: string): boolean {
    if (!error) return true;

    // Don't retry for certain types of errors
    const nonRetryableErrors = [
      'invalid email address',
      'template not found',
      'theme not found',
      'authentication failed',
      'invalid api key',
    ];

    const errorLower = error.toLowerCase();
    return !nonRetryableErrors.some(nonRetryable => errorLower.includes(nonRetryable));
  }
}

// Queue consumer function for Cloudflare Workers
export async function handleEmailQueueMessage(
  batch: MessageBatch<EmailQueueJob>,
  env: any
): Promise<void> {
  const emailService = (await import('./email')).createEmailService(env);
  const queueService = new CloudflareEmailQueueService(emailService, env.EMAIL_QUEUE);

  for (const message of batch.messages) {
    try {
      const job = message.body;
      
      // Check if job is scheduled for the future
      if (job.scheduledAt && job.scheduledAt > Date.now()) {
        // Re-queue for later processing
        await env.EMAIL_QUEUE.send(job, {
          delaySeconds: Math.max(60, Math.floor((job.scheduledAt - Date.now()) / 1000)),
        });
        message.ack();
        continue;
      }

      const result = await queueService.processJob(job);
      
      if (result.success) {
        console.log(`Email job ${job.id} processed successfully`);
        message.ack();
      } else if (result.shouldRetry) {
        console.log(`Email job ${job.id} failed, retrying. Attempt: ${job.attemptCount}`);
        
        // Calculate exponential backoff delay (2^attempt * 60 seconds, max 1 hour)
        const delaySeconds = Math.min(3600, Math.pow(2, job.attemptCount) * 60);
        
        await env.EMAIL_QUEUE.send(job, { delaySeconds });
        message.ack();
      } else {
        console.error(`Email job ${job.id} failed permanently:`, result.error);
        message.ack(); // Acknowledge to remove from queue
      }
    } catch (error) {
      console.error('Error processing email queue message:', error);
      // Don't ack the message so it will be retried
      message.retry();
    }
  }
}

// Factory function
export function createEmailQueueService(env: {
  SENDGRID_API_KEY?: string;
  DEFAULT_FROM_EMAIL?: string;
  DB: any;
  EMAIL_QUEUE: any;
}): EmailQueueService {
  const emailService = (require('./email')).createEmailService(env);
  return new CloudflareEmailQueueService(emailService, env.EMAIL_QUEUE);
}

// Priority mapping for queue processing
export const EMAIL_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal', 
  HIGH: 'high',
} as const;

export type EmailPriority = typeof EMAIL_PRIORITY[keyof typeof EMAIL_PRIORITY];