import React from 'react';
import renderer, { act } from 'react-test-renderer';
import SettingsScreen from '../settings';
import { useTaskManager } from '@/hooks/use-task-manager';
import { TextInput } from 'react-native';

jest.mock('@/hooks/use-task-manager', () => ({
  useTaskManager: jest.fn(() => ({
    profile: { getName: () => 'Original Name' },
    updateUserProfileName: jest.fn(() => Promise.resolve()),
    loaded: true,
    signOut: jest.fn(),
  })),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders settings view correctly', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<SettingsScreen />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('allows editing name and triggering profile update', async () => {
    const mockUpdateName = jest.fn(() => Promise.resolve());
    (useTaskManager as jest.Mock).mockReturnValue({
      profile: { getName: () => 'Original Name' },
      updateUserProfileName: mockUpdateName,
      loaded: true,
      signOut: jest.fn(),
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<SettingsScreen />);
    });
    const input = component!.root.findByType(TextInput);
    
    act(() => {
      input.props.onChangeText('Modified Name');
    });

    const buttons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const saveButton = buttons.find(b => {
      try {
        const textNode = b.findByType('Text');
        return textNode.props.children === 'Guardar cambios' || textNode.props.children === 'Guardando...' || textNode.props.children === '¡Guardado!';
      } catch {
        return false;
      }
    });

    expect(saveButton).toBeDefined();
    
    await act(async () => {
      await saveButton!.props.onPress();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockUpdateName).toHaveBeenCalledWith('Modified Name');

    act(() => {
      component.unmount();
    });
  });

  it('allows logging out', () => {
    const mockSignOut = jest.fn();
    (useTaskManager as jest.Mock).mockReturnValue({
      profile: { getName: () => 'Original Name' },
      updateUserProfileName: jest.fn(),
      loaded: true,
      signOut: mockSignOut,
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<SettingsScreen />);
    });
    
    const buttons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const logoutButton = buttons.find(b => {
      try {
        const textNode = b.findByType('Text');
        return textNode.props.children === 'Cerrar sesión';
      } catch {
        return false;
      }
    });

    expect(logoutButton).toBeDefined();

    act(() => {
      logoutButton!.props.onPress();
    });

    expect(mockSignOut).toHaveBeenCalled();

    act(() => {
      component.unmount();
    });
  });
});
