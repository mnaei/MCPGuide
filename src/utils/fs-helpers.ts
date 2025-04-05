import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Ensures that the parent directory of a file exists
 */
export async function ensureParentDirectoryExists(filePath: string): Promise<void> {
  const dirname = path.dirname(filePath);
  await fs.mkdir(dirname, { recursive: true });
} 