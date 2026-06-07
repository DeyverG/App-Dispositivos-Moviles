import { BaseModel } from './BaseModel';

/**
 * Enumeration representing the valid priority levels of a Task.
 */
export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

/**
 * Class representing a Task in the system, inheriting core fields from BaseModel.
 * Implements encapsulation through private fields with public getter/setter accessors.
 */
export class Task extends BaseModel {
  private title: string;
  private description: string;
  private priority: TaskPriority;
  private completed: boolean;

  /**
   * Constructs a new Task instance.
   * @param title The title of the task (must not be empty).
   * @param description Detailed description of the task. Defaults to an empty string.
   * @param priority Priority of the task (High, Medium, Low). Defaults to Medium.
   * @param completed Completion status. Defaults to false.
   * @param id Optional existing ID for deserialization.
   * @param createdAt Optional existing creation timestamp for deserialization.
   */
  constructor(
    title: string,
    description: string = '',
    priority: TaskPriority = TaskPriority.MEDIUM,
    completed: boolean = false,
    id?: string,
    createdAt?: number
  ) {
    super(id, createdAt);
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.completed = completed;
  }

  /**
   * Gets the title of the task.
   */
  public getTitle(): string {
    return this.title;
  }

  /**
   * Sets the title of the task with validation.
   * @param title New title (cannot be empty or whitespace only).
   */
  public setTitle(title: string): void {
    if (!title || !title.trim()) {
      throw new Error('Task title cannot be empty.');
    }
    this.title = title;
  }

  /**
   * Gets the detailed description of the task.
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * Sets the description of the task.
   */
  public setDescription(description: string): void {
    this.description = description;
  }

  /**
   * Gets the priority of the task.
   */
  public getPriority(): TaskPriority {
    return this.priority;
  }

  /**
   * Sets the priority of the task.
   */
  public setPriority(priority: TaskPriority): void {
    this.priority = priority;
  }

  /**
   * Checks if the task is completed.
   */
  public isCompleted(): boolean {
    return this.completed;
  }

  /**
   * Toggles the completion state of the task.
   */
  public toggleComplete(): void {
    this.completed = !this.completed;
  }

  /**
   * Explicitly sets the completion state of the task.
   */
  public setCompleted(completed: boolean): void {
    this.completed = completed;
  }

  /**
   * Serializes the Task instance into a standard JSON object.
   * Overrides BaseModel.toJSON().
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.getId(),
      createdAt: this.getCreatedAt(),
      title: this.title,
      description: this.description,
      priority: this.priority,
      completed: this.completed,
    };
  }

  /**
   * Factory method to deserialize a JSON object into a Task instance.
   * @param json Serialized task data.
   * @returns A new Task instance with restored state.
   */
  public static fromJSON(json: Record<string, any>): Task {
    return new Task(
      json.title,
      json.description || '',
      (json.priority as TaskPriority) || TaskPriority.MEDIUM,
      !!json.completed,
      json.id,
      json.createdAt
    );
  }
}
