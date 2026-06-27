import { BaseModel } from '../BaseModel';

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'mocked-uuid-1234',
}));

class TestModel extends BaseModel {
  public toJSON(): Record<string, any> {
    return {
      id: this.getId(),
      createdAt: this.getCreatedAt(),
    };
  }
}

describe('BaseModel', () => {
  it('should initialize with a random UUID and current timestamp when not provided', () => {
    const before = Date.now();
    const model = new TestModel();
    const after = Date.now();

    expect(model.getId()).toBe('mocked-uuid-1234');
    expect(model.getCreatedAt()).toBeGreaterThanOrEqual(before);
    expect(model.getCreatedAt()).toBeLessThanOrEqual(after);
  });

  it('should use provided ID and timestamp', () => {
    const customId = 'custom-id';
    const customTime = 123456789;
    const model = new TestModel(customId, customTime);

    expect(model.getId()).toBe(customId);
    expect(model.getCreatedAt()).toBe(customTime);
  });
});
