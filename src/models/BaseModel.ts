/**
 * Abstract base class that provides common properties and methods for all application models.
 * It enforces encapsulation for the unique identifier and creation timestamp, and defines
 * a contract for JSON serialization.
 */
export abstract class BaseModel {
  /**
   * Unique identifier of the model instance.
   * Encapsulated as protected to allow subclasses access while preventing outside tampering.
   */
  protected id: string;

  /**
   * Timestamp (in milliseconds) representing when the instance was created.
   * Encapsulated as protected to ensure immutability of creation records.
   */
  protected createdAt: number;

  /**
   * Initializes a new instance of BaseModel.
   * @param id Optional existing unique identifier. If omitted, a random 7-character ID will be generated.
   * @param createdAt Optional existing creation timestamp. If omitted, the current timestamp is used.
   */
  constructor(id?: string, createdAt?: number) {
    this.id = id || Math.random().toString(36).substring(2, 9);
    this.createdAt = createdAt || Date.now();
  }

  /**
   * Gets the unique identifier of this instance.
   * @returns The unique ID string.
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Gets the timestamp when this instance was created.
   * @returns The timestamp in milliseconds.
   */
  public getCreatedAt(): number {
    return this.createdAt;
  }

  /**
   * Abstract method that must be implemented by subclasses to serialize the model into a standard JSON object.
   * @returns A dictionary of primitive key-value pairs representing the serialized state.
   */
  public abstract toJSON(): Record<string, any>;
}
