import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import {
  onValue,
  ref,
  remove,
  set,
  Unsubscribe
} from 'firebase/database';
import { Task, TaskPriority, TaskLocation } from '../models/Task';
import { UserProfile } from '../models/UserProfile';
import { getFirebaseAuth, getFirebaseDatabase } from './firebase';

type StateChangeListener = () => void;

/**
 * Singleton class that orchestrates the core business logic of the Taskly application.
 * Manages tasks and user profiles, enforces validation rules, and handles persistence with Firebase.
 * Implements the Observer pattern to keep React components reactive.
 */
export class TaskManager {
  private static instance: TaskManager | null = null;

  // Encapsulated state properties
  private tasks: Task[] = [];
  private profile: UserProfile;
  private readonly listeners: Set<StateChangeListener> = new Set();
  private loaded: boolean = false;
  
  // Firebase Auth state
  private currentUser: User | null = null;
  private authLoaded: boolean = false;

  // Firebase listener unsubscribes
  private tasksListenerUnsubscribe: Unsubscribe | null = null;
  private profileListenerUnsubscribe: Unsubscribe | null = null;

  // Lazy getters for Firebase services
  private get auth() {
    return getFirebaseAuth();
  }

  private get database() {
    return getFirebaseDatabase();
  }

  private constructor() {
    this.profile = new UserProfile('');
    // Listen to Firebase Auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.handleAuthStateChange(user);
    });
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

  /**
   * Responds to Firebase Auth state changes. Sets listeners for the user's tasks
   * and profile name, or unsubscribes them upon sign out.
   */
  private async handleAuthStateChange(user: User | null): Promise<void> {
    // Unsubscribe from previous database paths
    if (this.tasksListenerUnsubscribe) {
      this.tasksListenerUnsubscribe();
      this.tasksListenerUnsubscribe = null;
    }
    if (this.profileListenerUnsubscribe) {
      this.profileListenerUnsubscribe();
      this.profileListenerUnsubscribe = null;
    }

    this.currentUser = user;

    if (user) {
      // 1. Subscribe to profile name changes in Realtime Database
      const profileRef = ref(this.database, `users/${user.uid}/profile`);
      this.profileListenerUnsubscribe = onValue(profileRef, (snapshot) => {
        const val = snapshot.val();
        if (val?.name) {
          this.profile = new UserProfile(val.name);
        } else {
          // Fallback to displayName or prefix of email
          const defaultName = user.displayName || user.email?.split('@')[0] || 'Usuario';
          this.profile = new UserProfile(defaultName);
          // Set in database as initialization
          set(profileRef, { name: defaultName });
        }
        this.notifyListeners();
      });

      // 2. Subscribe to tasks in Realtime Database
      const tasksRef = ref(this.database, `users/${user.uid}/tasks`);
      this.loaded = false;
      this.notifyListeners();

      this.tasksListenerUnsubscribe = onValue(tasksRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const tasksList: Task[] = [];
          Object.values(val).forEach(taskJson => {
            tasksList.push(this.deserializeTask(taskJson as Record<string, any>));
          });
          // Sort tasks by creation date (newest first)
          tasksList.sort((a, b) => b.getCreatedAt() - a.getCreatedAt());
          this.tasks = tasksList;
        } else {
          this.tasks = [];
        }
        this.loaded = true;
        this.notifyListeners();
      }, (error) => {
        console.error('Error listening to tasks in Realtime Database:', error);
        this.loaded = true;
        this.notifyListeners();
      });

    } else {
      // Clear data if logged out
      this.tasks = [];
      this.profile = new UserProfile('');
      this.loaded = true;
      this.notifyListeners();
    }

    this.authLoaded = true;
    this.notifyListeners();
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

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthLoaded(): boolean {
    return this.authLoaded;
  }

  /* ==========================================================
     AUTHENTICATION METHODS
     ========================================================== */
  
  public async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  public async signUp(name: string, email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    
    // Update profile display name in Firebase Auth
    await updateProfile(user, { displayName: name });
    
    // Set profile in Realtime Database
    const profileRef = ref(this.database, `users/${user.uid}/profile`);
    await set(profileRef, { name });
    
    return user;
  }

  public async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  /* ==========================================================
     TASK DATABASE OPERATIONS
     ========================================================== */

  public async addTask(
    title: string,
    description: string = '',
    priority: TaskPriority = TaskPriority.MEDIUM,
    location?: TaskLocation
  ): Promise<Task> {
    if (!this.currentUser) {
      throw new Error('No hay un usuario autenticado para realizar esta acción.');
    }
    const task = new Task(title, description, priority, false, undefined, undefined, location);
    const taskRef = ref(this.database, `users/${this.currentUser.uid}/tasks/${task.getId()}`);
    await set(taskRef, this.serializeTask(task));
    return task;
  }

  public async deleteTask(id: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }
    const taskRef = ref(this.database, `users/${this.currentUser.uid}/tasks/${id}`);
    await remove(taskRef);
    return true;
  }

  public async toggleTaskCompleted(id: string): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    const task = this.tasks.find(t => t.getId() === id);
    if (task) {
      const taskRef = ref(this.database, `users/${this.currentUser.uid}/tasks/${id}`);
      await set(taskRef, {
        ...this.serializeTask(task),
        completed: !task.isCompleted(),
      });
    }
  }

  public async updateUserProfileName(name: string): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    // Update display name in Firebase Auth
    await updateProfile(this.currentUser, { displayName: name });
    // Update profile in database
    const profileRef = ref(this.database, `users/${this.currentUser.uid}/profile`);
    await set(profileRef, { name });
  }

  /* ==========================================================
     SERIALIZATION HELPERS (Maps Low/Medium/High to bajo/media/alta)
     ========================================================== */

  private serializeTask(task: Task): Record<string, any> {
    let priorityStr = 'media';
    if (task.getPriority() === TaskPriority.HIGH) priorityStr = 'alta';
    else if (task.getPriority() === TaskPriority.LOW) priorityStr = 'bajo';

    const serialized: Record<string, any> = {
      id: task.getId(),
      createdAt: task.getCreatedAt(),
      title: task.getTitle(),
      description: task.getDescription(),
      priority: priorityStr,
      completed: task.isCompleted(),
    };

    if (task.getLocation()) {
      serialized.location = task.getLocation();
    }

    return serialized;
  }

  private deserializeTask(json: Record<string, any>): Task {
    let priorityVal = TaskPriority.MEDIUM;
    if (json.priority === 'alta') priorityVal = TaskPriority.HIGH;
    else if (json.priority === 'bajo') priorityVal = TaskPriority.LOW;

    return new Task(
      json.title,
      json.description || '',
      priorityVal,
      !!json.completed,
      json.id,
      json.createdAt,
      json.location || undefined
    );
  }
}
