/* eslint-disable */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import TabLayout from '../_layout';
import { useTaskManager } from '@/hooks/use-task-manager';

jest.mock('@/hooks/use-task-manager', () => ({
  useTaskManager: jest.fn(),
}));

jest.mock('@/components/app-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'AppTabs' });
});

jest.mock('@/components/auth-screen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'AuthScreen' });
});

jest.mock('@/components/animated-icon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AnimatedSplashOverlay: () => React.createElement(View, { testID: 'AnimatedSplashOverlay' }),
  };
});

describe('_layout (TabLayout)', () => {
  it('renders loading indicator when auth is not loaded', () => {
    (useTaskManager as jest.Mock).mockReturnValue({
      user: null,
      authLoaded: false,
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TabLayout />);
    });
    expect(component!.toJSON()).toBeDefined();
    
    act(() => {
      component.unmount();
    });
  });

  it('renders AppTabs when user is logged in', () => {
    (useTaskManager as jest.Mock).mockReturnValue({
      user: { uid: 'test-user' },
      authLoaded: true,
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TabLayout />);
    });
    expect(component!.root.findByProps({ testID: 'AppTabs' })).toBeDefined();

    act(() => {
      component.unmount();
    });
  });

  it('renders AuthScreen when user is logged out', () => {
    (useTaskManager as jest.Mock).mockReturnValue({
      user: null,
      authLoaded: true,
    });

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TabLayout />);
    });
    expect(component!.root.findByProps({ testID: 'AuthScreen' })).toBeDefined();

    act(() => {
      component.unmount();
    });
  });
});
