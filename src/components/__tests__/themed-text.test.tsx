import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemedText } from '../themed-text';

describe('ThemedText', () => {
  it('renders correctly with defaults', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ThemedText>Default Text</ThemedText>);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders correctly for different types', () => {
    const types = ['default', 'title', 'small', 'smallBold', 'subtitle', 'link', 'linkPrimary', 'code'] as const;
    types.forEach(type => {
      let component: renderer.ReactTestRenderer;
      act(() => {
        component = renderer.create(<ThemedText type={type}>Text</ThemedText>);
      });
      expect(component!.toJSON()).toBeDefined();
      act(() => {
        component.unmount();
      });
    });
  });
});
