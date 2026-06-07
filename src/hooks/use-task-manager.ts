import { useEffect, useState } from 'react';
import { TaskManager } from '../services/TaskManager';
import { Task, TaskPriority } from '../models/Task';
import { UserProfile } from '../models/UserProfile';

/**
 * Custom React hook that connects components to the TaskManager OOP singleton.
 * Synchronizes the component state React-actively on any changes and exposes CRUD actions.
 */
export function useTaskManager() {
  const manager = TaskManager.getInstance();

  // Local state mirrored from the singleton
  const [tasks, setTasks] = useState<Task[]>(manager.getTasks());
  const [profile, setProfile] = useState<UserProfile>(manager.getUserProfile());
  const [loaded, setLoaded] = useState<boolean>(manager.isLoaded());

  useEffect(() => {
    // Subscribe to state change notifications from the Singleton manager
    const unsubscribe = manager.subscribe(() => {
      setTasks(manager.getTasks());
      setProfile(manager.getUserProfile());
      setLoaded(manager.isLoaded());
    });

    // Sync state in case it loaded/changed before mount
    setTasks(manager.getTasks());
    setProfile(manager.getUserProfile());
    setLoaded(manager.isLoaded());

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  // Expose the reactive state and business logic methods
  return {
    tasks,
    profile,
    loaded,
    addTask: (title: string, description: string = '', priority: TaskPriority = TaskPriority.MEDIUM) =>
      manager.addTask(title, description, priority),
    deleteTask: (id: string) =>
      manager.deleteTask(id),
    toggleTaskCompleted: (id: string) =>
      manager.toggleTaskCompleted(id),
    updateUserProfileName: (name: string) =>
      manager.updateUserProfileName(name),
  };
}
