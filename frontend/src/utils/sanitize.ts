/**
 * Input sanitization utilities for security
 */

/**
 * Sanitizes text input to prevent XSS attacks
 * Removes potentially dangerous HTML tags and scripts
 * Note: We keep quotes and basic punctuation for natural messaging
 */
export const sanitizeText = (text: string): string => {
  if (!text) return ''
  
  // Remove HTML tags (but keep text content)
  let sanitized = text.replace(/<[^>]*>/g, '')
  
  // Remove dangerous script patterns
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  sanitized = sanitized.replace(/<script/gi, '')
  sanitized = sanitized.replace(/<\/script>/gi, '')
  sanitized = sanitized.replace(/<iframe/gi, '')
  sanitized = sanitized.replace(/<object/gi, '')
  sanitized = sanitized.replace(/<embed/gi, '')
  
  // Remove data URIs that might contain scripts
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // Trim whitespace but keep internal spaces and punctuation
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validates message content length
 */
export const validateMessageLength = (content: string, maxLength: number = 5000): boolean => {
  return content.length > 0 && content.length <= maxLength
}

/**
 * Validates file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => file.type.startsWith(type))
}

/**
 * Validates file size (in bytes)
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size > 0 && file.size <= maxSize
}

/**
 * Sanitizes filename to prevent directory traversal attacks
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove path separators and dangerous characters
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\.\./g, '')
    .trim()
    .substring(0, 255) // Limit length
}

