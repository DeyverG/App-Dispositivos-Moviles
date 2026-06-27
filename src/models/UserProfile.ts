import { BaseModel } from './BaseModel';

/**
 * Class representing a User Profile, extending BaseModel.
 * Encapsulates settings such as the user's name.
 */
export class UserProfile extends BaseModel {
  private name: string;

  /**
   * Constructs a new UserProfile instance.
   * @param name User's display name. Defaults to 'Alex Rivera'.
   * @param id Optional existing ID for deserialization.
   * @param createdAt Optional existing creation timestamp.
   */
  constructor(name: string = 'Alex Rivera', id?: string, createdAt?: number) {
    super(id, createdAt);
    this.name = name;
  }

  /**
   * Gets the display name of the user.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Sets the user's display name with validation.
   * @param name New display name (cannot be empty or whitespace only).
   */
  public setName(name: string): void {
    if (!name?.trim()) {
      throw new Error('User name cannot be empty.');
    }
    this.name = name;
  }

  /**
   * Serializes the UserProfile instance into a standard JSON object.
   * Overrides BaseModel.toJSON().
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.getId(),
      createdAt: this.getCreatedAt(),
      name: this.name,
    };
  }

  /**
   * Factory method to deserialize a JSON object into a UserProfile instance.
   * @param json Serialized profile data.
   * @returns A new UserProfile instance with restored state.
   */
  public static fromJSON(json: Record<string, any>): UserProfile {
    return new UserProfile(
      json.name || 'Alex Rivera',
      json.id,
      json.createdAt
    );
  }
}
