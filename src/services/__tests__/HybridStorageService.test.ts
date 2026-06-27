/* eslint-disable */
import { Platform } from 'react-native';
import { HybridStorageService } from '../HybridStorageService';

describe('HybridStorageService', () => {
  let originalPlatformOS: string;

  beforeAll(() => {
    originalPlatformOS = Platform.OS;
  });

  afterAll(() => {
    Platform.OS = originalPlatformOS as any;
  });

  it('should use NativeSecureStorageService when Platform.OS is ios or android', async () => {
    Platform.OS = 'ios';
    jest.resetModules();
    const service = new HybridStorageService();
    
    await service.setItem('key', 'val');
    const secureStore = require('expo-secure-store');
    expect(secureStore.setItemAsync).toHaveBeenCalledWith('key', 'val');

    await service.getItem('key');
    expect(secureStore.getItemAsync).toHaveBeenCalledWith('key');

    await service.removeItem('key');
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('key');
  });

  it('should use WebLocalStorageService when Platform.OS is web', async () => {
    Platform.OS = 'web';
    
    // Mock global window and localStorage
    const mockLocalStorage = {
      getItem: jest.fn(() => 'web-value'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    global.window = { localStorage: mockLocalStorage } as any;

    const service = new HybridStorageService();
    
    await service.setItem('web-key', 'web-val');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('web-key', 'web-val');

    const val = await service.getItem('web-key');
    expect(val).toBe('web-value');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('web-key');

    await service.removeItem('web-key');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('web-key');
    
    // Clean up
    delete (global as any).window;
  });

  it('should return null or handle errors gracefully when secure store throws', async () => {
    const SecureStore = require('expo-secure-store');
    const getItemSpy = jest.spyOn(SecureStore, 'getItemAsync').mockRejectedValueOnce(new Error('fail'));
    const setItemSpy = jest.spyOn(SecureStore, 'setItemAsync').mockRejectedValueOnce(new Error('fail'));
    const deleteItemSpy = jest.spyOn(SecureStore, 'deleteItemAsync').mockRejectedValueOnce(new Error('fail'));

    Platform.OS = 'ios';
    const service = new HybridStorageService();
    
    expect(await service.getItem('key')).toBeNull();
    
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await service.setItem('key', 'value');
    await service.removeItem('key');
    expect(warnSpy).toHaveBeenCalled();
    
    warnSpy.mockRestore();
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    deleteItemSpy.mockRestore();
  });

  it('should handle errors gracefully when localStorage throws', async () => {
    Platform.OS = 'web';
    const mockLocalStorage = {
      getItem: jest.fn(() => { throw new Error('fail'); }),
      setItem: jest.fn(() => { throw new Error('fail'); }),
      removeItem: jest.fn(() => { throw new Error('fail'); }),
    };
    global.window = { localStorage: mockLocalStorage } as any;

    const service = new HybridStorageService();
    
    expect(await service.getItem('key')).toBeNull();
    
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await service.setItem('key', 'value');
    await service.removeItem('key');
    expect(warnSpy).toHaveBeenCalled();
    
    warnSpy.mockRestore();
    delete (global as any).window;
  });
});
