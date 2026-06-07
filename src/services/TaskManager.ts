import { Task, TaskPriority } from '../models/Task';
import { UserProfile } from '../models/UserProfile';
import { StorageService } from './StorageService';
import { HybridStorageService } from './HybridStorageService';

type StateChangeListener = () => void;

/**
 * Singleton class that orchestrates the core business logic of the Taskly application.
 * Manages tasks and user profiles, enforces validation rules, and handles persistence.
 * Implements the Observer pattern to keep React components reactive.
 */
export class TaskManager {
  private static instance: TaskManager | null = null;

  // Encapsulated state properties
  private tasks: Task[] = [];
  private profile: UserProfile;
  private storage: StorageService;
  private listeners: Set<StateChangeListener> = new Set();
  private loaded: boolean = false;

  private constructor() {
    this.profile = new UserProfile('Deyver');
    this.storage = new HybridStorageService();
    this.loadPersistedData();
  }

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  public static resetInstance(): void {
    TaskManager.instance = null;
  }

  public setStorageService(storage: StorageService): void {
    this.storage = storage;
    this.loaded = false;
    this.loadPersistedData();
  }

  /**
   * Loads saved tasks and profile name. Starts empty if no tasks exist (no defaults).
   */
  private async loadPersistedData(): Promise<void> {
    try {
      const storedProfile = await this.storage.getItem('taskly_user_profile');
      if (storedProfile) {
        this.profile = UserProfile.fromJSON(JSON.parse(storedProfile));
      }

      const storedTasks = await this.storage.getItem('taskly_user_tasks');
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks) as Record<string, any>[];
        this.tasks = parsed.map(t => Task.fromJSON(t));
      } else {
        // No default tasks seeded, start completely empty as requested
        this.tasks = [];
        await this.persistData();
      }
    } catch (e) {
      console.error('Error loading persisted data inside TaskManager:', e);
    } finally {
      this.loaded = true;
      this.notifyListeners();
    }
  }

  private async persistData(): Promise<void> {
    try {
      await this.storage.setItem('taskly_user_profile', JSON.stringify(this.profile.toJSON()));
      await this.storage.setItem('taskly_user_tasks', JSON.stringify(this.tasks.map(t => t.toJSON())));
    } catch (e) {
      console.error('Error persisting data inside TaskManager:', e);
    }
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Observer notification failed:', e);
      }
    });
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public getTasksByPriority(priority: TaskPriority): Task[] {
    return this.tasks.filter(t => t.getPriority() === priority);
  }

  public getUserProfile(): UserProfile {
    return this.profile;
  }

  /**
   * Optimistic UI update: notify listeners first, then persist in background
   */
  public async addTask(title: string, description: string = '', priority: TaskPriority = TaskPriority.MEDIUM): Promise<Task> {
    const task = new Task(title, description, priority);
    this.tasks.push(task);
    this.notifyListeners();
    await this.persistData();
    return task;
  }

  /**
   * Optimistic UI update: notify listeners first, then persist in background
   */
  public async deleteTask(id: string): Promise<boolean> {
    const originalLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.getId() !== id);
    const deleted = this.tasks.length < originalLength;
    if (deleted) {
      this.notifyListeners();
      await this.persistData();
    }
    return deleted;
  }

  /**
   * Instantly toggles the task completion using immutability, notifying listeners first.
   */
  public async toggleTaskCompleted(id: string): Promise<void> {
    this.tasks = this.tasks.map(t => {
      if (t.getId() === id) {
        // Immutable update: create a new Task object reference to trigger React state updates
        return new Task(
          t.getTitle(),
          t.getDescription(),
          t.getPriority(),
          !t.isCompleted(),
          t.getId(),
          t.getCreatedAt()
        );
      }
      return t;
    });
    this.notifyListeners();
    await this.persistData();
  }

  /**
   * Optimistic UI update: notify listeners first, then persist in background
   */
  public async updateUserProfileName(name: string): Promise<void> {
    this.profile.setName(name);
    this.notifyListeners();
    await this.persistData();
  }
}
