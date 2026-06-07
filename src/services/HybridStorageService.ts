import { Platform } from 'react-native';
import { StorageService } from './StorageService';

/**
 * Polymorphic storage service that delegates to browser localStorage on the web,
 * and standard AsyncStorage on native environments (iOS/Android).
 */
export class HybridStorageService extends StorageService {
  private delegate: StorageService;

  constructor() {
    super();
    // Select delegate purely based on Platform.OS to handle SSR / Static rendering environments safely
    if (Platform.OS === 'web') {
      this.delegate = new WebLocalStorageService();
    } else {
      this.delegate = new NativeAsyncStorageService();
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
 * Internal concrete class that interacts with native AsyncStorage.
 * Uses dynamic require to prevent loading the module on the web, which avoids native warning logs.
 */
class NativeAsyncStorageService extends StorageService {
  private getStorage() {
    try {
      return require('@react-native-async-storage/async-storage').default;
    } catch (e) {
      console.warn('Failed to require AsyncStorage:', e);
      return null;
    }
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      const storage = this.getStorage();
      if (!storage) return null;
      return await storage.getItem(key);
    } catch {
      return null;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      await storage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage write failed:', e);
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      await storage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage remove failed:', e);
    }
  }
}
