/**
 * Abstract class defining the contract for data persistence in the application.
 * Enables polymorphism for storage engines (e.g., memory storage, web local storage, React Native AsyncStorage).
 */
export abstract class StorageService {
  /**
   * Retrieves an item associated with the given key.
   * @param key Unique key string.
   * @returns A promise resolving to the string value, or null if not found.
   */
  public abstract getItem(key: string): Promise<string | null>;

  /**
   * Stores a key-value pair.
   * @param key Unique key string.
   * @param value String value to store.
   */
  public abstract setItem(key: string, value: string): Promise<void>;

  /**
   * Removes an item associated with the given key.
   * @param key Unique key string.
   */
  public abstract removeItem(key: string): Promise<void>;
}
