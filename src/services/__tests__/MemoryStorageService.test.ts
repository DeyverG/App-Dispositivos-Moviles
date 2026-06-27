import { MemoryStorageService } from '../MemoryStorageService';

describe('MemoryStorageService', () => {
  let service: MemoryStorageService;

  beforeEach(() => {
    service = new MemoryStorageService();
  });

  it('should store and retrieve items correctly', async () => {
    await service.setItem('test-key', 'test-value');
    const value = await service.getItem('test-key');
    expect(value).toBe('test-value');
  });

  it('should return null for non-existent items', async () => {
    const value = await service.getItem('non-existent');
    expect(value).toBeNull();
  });

  it('should remove items correctly', async () => {
    await service.setItem('test-key', 'test-value');
    await service.removeItem('test-key');
    const value = await service.getItem('test-key');
    expect(value).toBeNull();
  });
});
