import React from 'react';
import { Text } from 'react-native';
import { useTaskManager } from '../use-task-manager';
import { TaskManager } from '../../services/TaskManager';
import renderer, { act } from 'react-test-renderer';

jest.mock('../../services/TaskManager', () => {
  const mockManager = {
    getTasks: jest.fn(() => []),
    getUserProfile: jest.fn(() => ({ getName: () => 'Test User' })),
    isLoaded: jest.fn(() => true),
    getCurrentUser: jest.fn(() => null),
    isAuthLoaded: jest.fn(() => true),
    subscribe: jest.fn((callback) => {
      (mockManager as any).trigger = callback;
      return jest.fn();
    }),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    addTask: jest.fn(),
    deleteTask: jest.fn(),
    toggleTaskCompleted: jest.fn(),
    updateUserProfileName: jest.fn(),
  };
  return {
    TaskManager: {
      getInstance: () => mockManager,
    },
  };
});

function TestComponent() {
  const result = useTaskManager();
  return <Text>{result.profile.getName()}</Text>;
}

describe('useTaskManager hook', () => {
  it('should initialize and subscribe to TaskManager changes', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestComponent />);
    });

    const manager = TaskManager.getInstance();
    expect(manager.subscribe).toHaveBeenCalled();
    expect(component!.root.findByType(Text).props.children).toBe('Test User');

    act(() => {
      component.unmount();
    });
  });

  it('should expose CRUD actions that call TaskManager methods', () => {
    let result: any = null;
    function HelperComponent() {
      const val = useTaskManager();
      React.useEffect(() => {
        result = val;
      });
      return null;
    }
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<HelperComponent />);
    });
    const manager = TaskManager.getInstance();

    result.signIn('a', 'b');
    expect(manager.signIn).toHaveBeenCalledWith('a', 'b');

    result.signUp('n', 'e', 'p');
    expect(manager.signUp).toHaveBeenCalledWith('n', 'e', 'p');

    result.signOut();
    expect(manager.signOut).toHaveBeenCalled();

    result.addTask('t');
    expect(manager.addTask).toHaveBeenCalledWith('t', '', 'Medium', undefined);

    result.deleteTask('id');
    expect(manager.deleteTask).toHaveBeenCalledWith('id');

    result.toggleTaskCompleted('id');
    expect(manager.toggleTaskCompleted).toHaveBeenCalledWith('id');

    result.updateUserProfileName('name');
    expect(manager.updateUserProfileName).toHaveBeenCalledWith('name');

    act(() => {
      component.unmount();
    });
  });
});
