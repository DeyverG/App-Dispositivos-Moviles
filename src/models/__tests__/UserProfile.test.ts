import { UserProfile } from '../UserProfile';

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'mocked-uuid-profile',
}));

describe('UserProfile Model', () => {
  it('should initialize with default values', () => {
    const profile = new UserProfile();
    expect(profile.getName()).toBe('Alex Rivera');
    expect(profile.getId()).toBe('mocked-uuid-profile');
  });

  it('should validate and set name correctly', () => {
    const profile = new UserProfile('Alex');
    expect(profile.getName()).toBe('Alex');

    expect(() => profile.setName('')).toThrow('User name cannot be empty.');
    expect(() => profile.setName('   ')).toThrow('User name cannot be empty.');

    profile.setName('New Name');
    expect(profile.getName()).toBe('New Name');
  });

  it('should serialize to JSON correctly', () => {
    const createdAt = Date.now();
    const profile = new UserProfile('Bob', 'uuid-abc', createdAt);
    expect(profile.toJSON()).toEqual({
      id: 'uuid-abc',
      createdAt,
      name: 'Bob',
    });
  });

  it('should deserialize from JSON correctly', () => {
    const createdAt = Date.now();
    const json = {
      id: 'uuid-xyz',
      createdAt,
      name: 'Alice',
    };
    const profile = UserProfile.fromJSON(json);
    expect(profile.getId()).toBe('uuid-xyz');
    expect(profile.getCreatedAt()).toBe(createdAt);
    expect(profile.getName()).toBe('Alice');
  });
});
