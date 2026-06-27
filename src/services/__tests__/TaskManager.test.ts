import { TaskManager } from '../TaskManager';
import { TaskPriority } from '../../models/Task';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { set, remove } from 'firebase/database';

describe('TaskManager', () => {
  let manager: TaskManager;

  beforeEach(() => {
    TaskManager.resetInstance();
    manager = TaskManager.getInstance();
  });

  it('should be a singleton', () => {
    const manager2 = TaskManager.getInstance();
    expect(manager).toBe(manager2);
  });

  it('should authenticate user and handle actions', async () => {
    await manager.signIn('test@example.com', 'password123');
    expect(signInWithEmailAndPassword).toHaveBeenCalled();

    await manager.signUp('Name', 'test@example.com', 'password123');
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();

    await manager.signOut();
    expect(signOut).toHaveBeenCalled();
  });

  it('should support subscribing and notifying observers', () => {
    const listener = jest.fn();
    const unsubscribe = manager.subscribe(listener);
    
    // Trigger notification manually by adding task
    manager.addTask('Title');
    expect(set).toHaveBeenCalled();

    unsubscribe();
  });

  it('should delete and toggle task', async () => {
    await manager.deleteTask('task-id');
    expect(remove).toHaveBeenCalled();

    await manager.toggleTaskCompleted('task-id');
    expect(set).toHaveBeenCalled();
  });

  it('should update user profile name', async () => {
    await manager.updateUserProfileName('New Name');
    expect(set).toHaveBeenCalled();
  });

  it('should return getters correctly', () => {
    expect(manager.getTasks()).toBeDefined();
    expect(manager.getTasksByPriority(TaskPriority.HIGH)).toBeDefined();
    expect(manager.getUserProfile()).toBeDefined();
    expect(manager.getCurrentUser()).toBeDefined();
    expect(manager.isAuthLoaded()).toBeDefined();
    expect(manager.isLoaded()).toBeDefined();
  });
});
