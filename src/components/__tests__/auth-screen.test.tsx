import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AuthScreen from '../auth-screen';
import { useTaskManager } from '@/hooks/use-task-manager';
import { TextInput } from 'react-native';

jest.mock('@/hooks/use-task-manager', () => ({
  useTaskManager: jest.fn(() => ({
    signIn: jest.fn(() => Promise.resolve()),
    signUp: jest.fn(() => Promise.resolve()),
  })),
}));

describe('AuthScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login view by default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<AuthScreen />);
    });
    expect(component!.root).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('allows typing email and password and calling login', async () => {
    const mockSignIn = jest.fn(() => Promise.resolve());
    (useTaskManager as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: jest.fn(),
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<AuthScreen />);
    });
    
    const inputs = component!.root.findAllByType(TextInput);
    const emailInputs = inputs.filter(i => i.props.placeholder === 'usuario@correo.com');
    const loginEmailInput = emailInputs[0];
    const passwordInput = inputs.find(i => i.props.placeholder === '••••••••');

    act(() => {
      loginEmailInput!.props.onChangeText('test@example.com');
      passwordInput!.props.onChangeText('password123');
    });

    // Find the login button
    const buttons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const loginButton = buttons.find(b => {
      try {
        const textNode = b.findByType('Text');
        return textNode.props.children === 'Iniciar Sesión';
      } catch {
        return false;
      }
    });

    expect(loginButton).toBeDefined();

    await act(async () => {
      await loginButton!.props.onPress();
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');

    act(() => {
      component.unmount();
    });
  });

  it('allows toggling to registration view and signing up', async () => {
    const mockSignUp = jest.fn(() => Promise.resolve());
    (useTaskManager as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      signUp: mockSignUp,
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<AuthScreen />);
    });

    // Find the toggle button to register
    const buttons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const registerLink = buttons.find(b => {
      try {
        const textNode = b.findByType('Text');
        return textNode.props.children === 'Regístrate';
      } catch {
        return false;
      }
    });

    expect(registerLink).toBeDefined();

    act(() => {
      registerLink!.props.onPress();
    });

    const inputs = component!.root.findAllByType(TextInput);
    const nameInput = inputs.find(i => i.props.placeholder === 'Tu nombre');
    const emailInputs = inputs.filter(i => i.props.placeholder === 'usuario@correo.com');
    const registerEmailInput = emailInputs[1];
    const passwordInput = inputs.find(i => i.props.placeholder === 'Mínimo 6 caracteres');

    act(() => {
      nameInput!.props.onChangeText('Deyver');
      registerEmailInput!.props.onChangeText('test@example.com');
      passwordInput!.props.onChangeText('Password123!');
    });

    const regButtons = component!.root.findAll(node => typeof node.props.onPress === 'function');
    const signUpButton = regButtons.find(b => {
      try {
        const textNode = b.findByType('Text');
        return textNode.props.children === 'Registrarse';
      } catch {
        return false;
      }
    });

    expect(signUpButton).toBeDefined();

    await act(async () => {
      await signUpButton!.props.onPress();
    });

    expect(mockSignUp).toHaveBeenCalledWith('Deyver', 'test@example.com', 'Password123!');

    act(() => {
      component.unmount();
    });
  });
});
