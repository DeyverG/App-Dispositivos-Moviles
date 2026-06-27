import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ExternalLink } from '../external-link';
import { openBrowserAsync } from 'expo-web-browser';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: { AUTOMATIC: 0 },
}));

describe('ExternalLink', () => {
  let originalEnv: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.EXPO_OS;
  });

  afterAll(() => {
    process.env.EXPO_OS = originalEnv;
  });

  it('renders correctly', () => {
    let tree;
    act(() => {
      tree = renderer.create(<ExternalLink href="https://example.com">Link Text</ExternalLink>).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('opens link in browser on press for native', async () => {
    process.env.EXPO_OS = 'ios';
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ExternalLink href="https://example.com">Link Text</ExternalLink>);
    });
    const link = component!.root.findByType('Text');
    const mockEvent = { preventDefault: jest.fn() };
    
    await act(async () => {
      await link.props.onPress(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(openBrowserAsync).toHaveBeenCalledWith('https://example.com', expect.any(Object));
  });
});
