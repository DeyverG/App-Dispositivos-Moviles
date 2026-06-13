import { useEffect, useState } from 'react';
import { TaskManager } from '../services/TaskManager';
import { Task, TaskPriority, TaskLocation } from '../models/Task';
import { UserProfile } from '../models/UserProfile';
import { User } from 'firebase/auth';

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
  const [user, setUser] = useState<User | null>(manager.getCurrentUser());
  const [authLoaded, setAuthLoaded] = useState<boolean>(manager.isAuthLoaded());

  useEffect(() => {
    // Subscribe to state change notifications from the Singleton manager
    const unsubscribe = manager.subscribe(() => {
      setTasks(manager.getTasks());
      setProfile(manager.getUserProfile());
      setLoaded(manager.isLoaded());
      setUser(manager.getCurrentUser());
      setAuthLoaded(manager.isAuthLoaded());
    });

    // Sync state in case it loaded/changed before mount
    setTasks(manager.getTasks());
    setProfile(manager.getUserProfile());
    setLoaded(manager.isLoaded());
    setUser(manager.getCurrentUser());
    setAuthLoaded(manager.isAuthLoaded());

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  // Expose the reactive state and business logic methods
  return {
    tasks,
    profile,
    loaded,
    user,
    authLoaded,
    signIn: (email: string, password: string) =>
      manager.signIn(email, password),
    signUp: (name: string, email: string, password: string) =>
      manager.signUp(name, email, password),
    signOut: () =>
      manager.signOut(),
    addTask: (title: string, description: string = '', priority: TaskPriority = TaskPriority.MEDIUM, location?: TaskLocation) =>
      manager.addTask(title, description, priority, location),
    deleteTask: (id: string) =>
      manager.deleteTask(id),
    toggleTaskCompleted: (id: string) =>
      manager.toggleTaskCompleted(id),
    updateUserProfileName: (name: string) =>
      manager.updateUserProfileName(name),
  };
}
