import { StorageService } from '../StorageService';

class MockStorage extends StorageService {
  private data: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}

describe('StorageService abstract class', () => {
  it('defines abstract methods that subclasses must implement', async () => {
    const storage = new MockStorage();
    await storage.setItem('foo', 'bar');
    expect(await storage.getItem('foo')).toBe('bar');
    await storage.removeItem('foo');
    expect(await storage.getItem('foo')).toBeNull();
  });
});
