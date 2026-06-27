import { Task, TaskPriority } from '../Task';

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'mocked-uuid-task',
}));

describe('Task Model', () => {
  it('should initialize with default values', () => {
    const task = new Task('Test Title');
    expect(task.getTitle()).toBe('Test Title');
    expect(task.getDescription()).toBe('');
    expect(task.getPriority()).toBe(TaskPriority.MEDIUM);
    expect(task.isCompleted()).toBe(false);
    expect(task.getId()).toBe('mocked-uuid-task');
    expect(task.getLocation()).toBeUndefined();
  });

  it('should validate title and throw when invalid', () => {
    const task = new Task('Valid Title');
    expect(() => task.setTitle('')).toThrow('Task title cannot be empty.');
    expect(() => task.setTitle('   ')).toThrow('Task title cannot be empty.');
    
    // Check setting valid title
    task.setTitle('New Title');
    expect(task.getTitle()).toBe('New Title');
  });

  it('should set description and priority correctly', () => {
    const task = new Task('Task');
    task.setDescription('Description');
    task.setPriority(TaskPriority.HIGH);
    expect(task.getDescription()).toBe('Description');
    expect(task.getPriority()).toBe(TaskPriority.HIGH);
  });

  it('should handle completed state toggling and setting', () => {
    const task = new Task('Task');
    expect(task.isCompleted()).toBe(false);
    task.toggleComplete();
    expect(task.isCompleted()).toBe(true);
    task.setCompleted(false);
    expect(task.isCompleted()).toBe(false);
  });

  it('should handle location', () => {
    const task = new Task('Task');
    const location = { latitude: 12.34, longitude: 56.78, address: 'Test St' };
    task.setLocation(location);
    expect(task.getLocation()).toEqual(location);
  });

  it('should serialize to JSON correctly', () => {
    const createdAt = Date.now();
    const task = new Task('Task', 'Desc', TaskPriority.LOW, true, 'uuid-123', createdAt, { latitude: 10, longitude: 20, address: 'Loc' });
    const json = task.toJSON();
    expect(json).toEqual({
      id: 'uuid-123',
      createdAt,
      title: 'Task',
      description: 'Desc',
      priority: TaskPriority.LOW,
      completed: true,
      location: { latitude: 10, longitude: 20, address: 'Loc' },
    });
  });

  it('should deserialize from JSON correctly', () => {
    const createdAt = Date.now();
    const json = {
      id: 'uuid-123',
      createdAt,
      title: 'Deserialized Task',
      description: 'Desc',
      priority: TaskPriority.HIGH,
      completed: true,
      location: { latitude: 10, longitude: 20, address: 'Loc' },
    };
    const task = Task.fromJSON(json);
    expect(task.getId()).toBe('uuid-123');
    expect(task.getCreatedAt()).toBe(createdAt);
    expect(task.getTitle()).toBe('Deserialized Task');
    expect(task.getDescription()).toBe('Desc');
    expect(task.getPriority()).toBe(TaskPriority.HIGH);
    expect(task.isCompleted()).toBe(true);
    expect(task.getLocation()).toEqual({ latitude: 10, longitude: 20, address: 'Loc' });
  });
});
