import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HomeScreen from '../index';
import { useTaskManager } from '@/hooks/use-task-manager';
import { TextInput, Switch } from 'react-native';
import { Task, TaskPriority } from '@/models/Task';

jest.mock('@/hooks/use-task-manager', () => ({
  useTaskManager: jest.fn(() => ({
    tasks: [],
    profile: { getName: () => 'Deyver' },
    loaded: true,
    addTask: jest.fn(() => Promise.resolve()),
    toggleTaskCompleted: jest.fn(),
    deleteTask: jest.fn(),
  })),
}));

// Recursive helper to check if a node or any of its descendants contain the specified text
function hasTextContent(node: any, text: string): boolean {
  if (!node) return false;
  if (typeof node === 'string') {
    return node.includes(text);
  }
  if (node.props && node.props.children) {
    if (Array.isArray(node.props.children)) {
      return node.props.children.some((child: any) => hasTextContent(child, text));
    }
    return hasTextContent(node.props.children, text);
  }
  if (node.children) {
    return node.children.some((child: any) => hasTextContent(child, text));
  }
  return false;
}

describe('HomeScreen & AddTaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders empty state correctly when no tasks exist', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<HomeScreen />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders task list correctly when tasks exist', () => {
    const mockTasks = [
      new Task('Task 1', 'Desc 1', TaskPriority.HIGH, false, 'id-1'),
      new Task('Task 2', 'Desc 2', TaskPriority.LOW, true, 'id-2'),
    ];
    (useTaskManager as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      profile: { getName: () => 'Deyver' },
      loaded: true,
      addTask: jest.fn(),
      toggleTaskCompleted: jest.fn(),
      deleteTask: jest.fn(),
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<HomeScreen />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('opens and submits AddTaskForm correctly', async () => {
    const mockAddTask = jest.fn(() => Promise.resolve());
    (useTaskManager as jest.Mock).mockReturnValue({
      tasks: [],
      profile: { getName: () => 'Deyver' },
      loaded: true,
      addTask: mockAddTask,
      toggleTaskCompleted: jest.fn(),
      deleteTask: jest.fn(),
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<HomeScreen />);
    });
    
    // Find the CREAR TAREA button in the empty state
    const buttons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const createButton = buttons.find(b => hasTextContent(b, 'CREAR TAREA'));

    expect(createButton).toBeDefined();

    act(() => {
      createButton!.props.onPress();
    });

    const inputs = component!.root.findAllByType(TextInput);
    act(() => {
      inputs[0].props.onChangeText('Test Title');
      inputs[1].props.onChangeText('Test Description');
    });

    // Press priority button
    const formButtons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const priorityButton = formButtons.find(b => hasTextContent(b, 'Alta'));
    expect(priorityButton).toBeDefined();
    act(() => {
      priorityButton!.props.onPress();
    });

    // Toggle location switch on (to trigger requestLocationPermission and rendering map)
    const locSwitch = component!.root.findByType(Switch);
    await act(async () => {
      await locSwitch.props.onValueChange(true);
    });

    const saveButton = formButtons.find(b => hasTextContent(b, 'Guardar'));
    expect(saveButton).toBeDefined();
    
    await act(async () => {
      await saveButton!.props.onPress();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockAddTask).toHaveBeenCalledWith('Test Title', 'Test Description', TaskPriority.HIGH, expect.any(Object));

    act(() => {
      component.unmount();
    });
  });

  it('triggers task completed toggling and task deletion correctly', () => {
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockTasks = [
      new Task('Task 1', 'Desc 1', TaskPriority.HIGH, false, 'id-1'),
    ];
    (useTaskManager as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      profile: { getName: () => 'Deyver' },
      loaded: true,
      addTask: jest.fn(),
      toggleTaskCompleted: mockToggle,
      deleteTask: mockDelete,
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<HomeScreen />);
    });

    const clickables = component!.root.findAll(node => typeof node.props.onPress === 'function');
    
    const toggleButton = clickables.find(c => hasTextContent(c, 'Task 1'));

    expect(toggleButton).toBeDefined();
    act(() => {
      toggleButton!.props.onPress();
    });
    expect(mockToggle).toHaveBeenCalledWith('id-1');

    const deleteButton = clickables.find(c => {
      try {
        return c.find(node => {
          const name = node.props.name;
          return name === 'delete' || (name && name.android === 'delete');
        }) !== undefined;
      } catch {
        return false;
      }
    });

    expect(deleteButton).toBeDefined();
    act(() => {
      deleteButton!.props.onPress();
    });
    expect(mockDelete).toHaveBeenCalledWith('id-1');

    act(() => {
      component.unmount();
    });
  });
});
