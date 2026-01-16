/**
 * Slug generation utilities for creating URL-friendly slugs
 */

/**
 * Generate URL-friendly slug from text
 * 
 * Features:
 * - Converts to lowercase
 * - Handles accented characters (NFD normalization)
 * - Removes diacritics
 * - Keeps only alphanumeric, spaces, underscores, and hyphens
 * - Replaces spaces with hyphens
 * - Collapses multiple hyphens/underscores
 * - Trims leading/trailing hyphens/underscores
 * - Limits length to 100 characters
 * 
 * @param text - Text to slugify
 * @returns URL-safe slug
 * 
 * @example
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('Café París 2024') // 'cafe-paris-2024'
 * generateSlug('Multiple   Spaces') // 'multiple-spaces'
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters (e.g., é -> e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s_-]/g, '') // Keep only alphanumeric, spaces, underscores, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[-_]+/g, '-') // Collapse multiple hyphens/underscores
    .replace(/^[-_]+|[-_]+$/g, '') // Trim leading/trailing hyphens/underscores
    .substring(0, 100); // Limit length for URL safety
}
