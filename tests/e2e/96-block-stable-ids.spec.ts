import { test, expect } from '@playwright/test'
import { loginAsAdmin, createTestContent, getCollectionWithBlocks } from './utils/test-helpers'

/**
 * Issue #931: block array items need stable persisted IDs.
 * blockId must be generated on create and preserved on reorder/edit.
 */
