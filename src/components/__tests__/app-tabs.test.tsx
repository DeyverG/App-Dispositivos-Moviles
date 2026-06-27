/* eslint-disable */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AppTabs from '../app-tabs';
import AppTabsWeb, { TabButton, CustomTabList } from '../app-tabs.web';

jest.mock('expo-router/unstable-native-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const NativeTabs = (props: any) => React.createElement(View, props);
  (NativeTabs as any).Trigger = (props: any) => React.createElement(View, props);
  (NativeTabs as any).Trigger.Label = (props: any) => React.createElement(View, props);
  (NativeTabs as any).Trigger.Icon = (props: any) => React.createElement(View, props);
  return { NativeTabs };
});

jest.mock('expo-router/ui', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Tabs: (props: any) => React.createElement(View, props),
    TabList: (props: any) => React.createElement(View, props),
    TabTrigger: (props: any) => React.createElement(View, props),
    TabSlot: (props: any) => React.createElement(View, props),
  };
});

describe('AppTabs Components', () => {
  it('renders native AppTabs correctly', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<AppTabs />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders web AppTabs correctly', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<AppTabsWeb />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders TabButton correctly', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TabButton isFocused={true} name="index">Button</TabButton>);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders CustomTabList correctly', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CustomTabList />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });
});
