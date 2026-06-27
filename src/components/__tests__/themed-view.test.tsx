import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemedView } from '../themed-view';

describe('ThemedView', () => {
  it('renders correctly with default type', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ThemedView />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders correctly with specified type', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ThemedView type="surfaceContainer" />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });
});
