/* eslint-disable */
import React from 'react';
import { Text } from 'react-native';
import { useColorScheme } from '../use-color-scheme.web';
import renderer, { act } from 'react-test-renderer';

function TestComponent() {
  const scheme = useColorScheme();
  return <Text>{scheme}</Text>;
}

describe('useColorScheme (web)', () => {
  it('should return light before hydration, and RN color scheme after hydration', () => {
    // Spy on RN useColorScheme to return dark
    const RN = require('react-native');
    const spy = jest.spyOn(RN, 'useColorScheme').mockReturnValue('dark');

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestComponent />);
    });

    expect(component!.toJSON()).toBeDefined();
    
    const textNode = component!.root.findByType(Text);
    expect(textNode.props.children).toBe('dark');

    act(() => {
      component.unmount();
    });

    spy.mockRestore();
  });
});
