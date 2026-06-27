/* eslint-disable */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AnimatedSplashOverlay, AnimatedIcon } from '../animated-icon';
import { AnimatedSplashOverlay as AnimatedSplashOverlayWeb, AnimatedIcon as AnimatedIconWeb } from '../animated-icon.web';

describe('Animated Icons & Splash', () => {
  it('renders native AnimatedSplashOverlay and AnimatedIcon', () => {
    let tree1, tree2;
    act(() => {
      tree1 = renderer.create(<AnimatedSplashOverlay />).toJSON();
      tree2 = renderer.create(<AnimatedIcon />).toJSON();
    });
    expect(tree1).toBeDefined();
    expect(tree2).toBeDefined();
  });

  it('renders web AnimatedSplashOverlay and AnimatedIcon', () => {
    let tree1, tree2;
    act(() => {
      tree1 = renderer.create(<AnimatedSplashOverlayWeb />).toJSON();
      tree2 = renderer.create(<AnimatedIconWeb />).toJSON();
    });
    expect(tree1).toBeNull();
    expect(tree2).toBeDefined();
  });
});
