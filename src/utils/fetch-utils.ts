import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';

export interface FetchResult {
  success: boolean;
  status?: number;
  message?: string;
  data?: string;
}

export async function fetchWithRetry(
  url: string, 
  options?: any, /* Using any to avoid type conflicts */
  maxRetries = 3, 
  retryDelay = 1000
): Promise<FetchResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: `Server responded with status ${response.status}: ${response.statusText}`
        };
      }
      
      const data = await response.text();
      return { 
        success: true, 
        status: response.status,
        data 
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Only retry on network errors
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }
  
  return {
    success: false,
    message: `Request failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  };
}

export async function validateJson(content: string): Promise<{ valid: boolean; error?: string }> {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON format'
    };
  }
}

export async function ensureParentDirectoryExists(filePath: string): Promise<void> {
  const dirname = path.dirname(filePath);
  await fs.mkdir(dirname, { recursive: true });
}