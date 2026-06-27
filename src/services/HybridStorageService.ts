import { Platform } from 'react-native';
import { StorageService } from './StorageService';

/**
 * Polymorphic storage service that delegates to browser localStorage on the web,
 * and encrypted SecureStore on native environments (iOS/Android) for secure session data.
 */
export class HybridStorageService extends StorageService {
  private readonly delegate: StorageService;

  constructor() {
    super();
    // Select delegate purely based on Platform.OS to handle SSR / Static rendering environments safely
    if (Platform.OS === 'web') {
      this.delegate = new WebLocalStorageService();
    } else {
      this.delegate = new NativeSecureStorageService();
    }
  }

  public async getItem(key: string): Promise<string | null> {
    return this.delegate.getItem(key);
  }

  public async setItem(key: string, value: string): Promise<void> {
    await this.delegate.setItem(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    await this.delegate.removeItem(key);
  }
}

/**
 * Internal concrete class that interacts with browser localStorage.
 */
class WebLocalStorageService extends StorageService {
  private getStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      const storage = this.getStorage();
      if (!storage) return null;
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      storage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      storage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
  }
}

/**
 * Internal concrete class that interacts with native expo-secure-store.
 * Uses dynamic require to prevent loading the module on the web, which avoids native warning logs.
 */
class NativeSecureStorageService extends StorageService {
  private getStorage() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('expo-secure-store');
    } catch (e) {
      console.warn('Failed to require expo-secure-store:', e);
      return null;
    }
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      const storage = this.getStorage();
      if (!storage) return null;
      return await storage.getItemAsync(key);
    } catch {
      return null;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      await storage.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore write failed:', e);
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      await storage.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore remove failed:', e);
    }
  }
}
