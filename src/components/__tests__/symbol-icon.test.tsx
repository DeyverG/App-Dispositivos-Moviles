import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SymbolIcon } from '../symbol-icon';
import { Platform } from 'react-native';

describe('SymbolIcon', () => {
  let originalPlatformOS: string;

  beforeAll(() => {
    originalPlatformOS = Platform.OS;
  });

  afterAll(() => {
    Platform.OS = originalPlatformOS as any;
  });

  it('renders correctly on native platform', () => {
    Platform.OS = 'ios';
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<SymbolIcon name="add" color="red" />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });

  it('renders correctly on web platform', () => {
    Platform.OS = 'web';
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<SymbolIcon name="add" color="red" />);
    });
    expect(component!.toJSON()).toBeDefined();
    act(() => {
      component.unmount();
    });
  });
});
