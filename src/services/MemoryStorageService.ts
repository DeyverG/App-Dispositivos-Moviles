import { StorageService } from './StorageService';

/**
 * Concrete implementation of StorageService that holds key-value pairs in memory.
 * Primarily used as a fallback, during testing, or when running in restricted environments.
 */
export class MemoryStorageService extends StorageService {
  private readonly storage: Map<string, string> = new Map();

  /**
   * Retrieves an item from the in-memory map.
   * @param key Unique key.
   */
  public async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  /**
   * Stores a key-value pair in the in-memory map.
   * @param key Unique key.
   * @param value Value string.
   */
  public async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  /**
   * Removes an item from the in-memory map.
   * @param key Unique key.
   */
  public async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}
