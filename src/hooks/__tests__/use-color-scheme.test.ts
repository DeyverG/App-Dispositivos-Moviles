import { useColorScheme } from '../use-color-scheme';

describe('useColorScheme re-export', () => {
  it('should return light color scheme by default', () => {
    const val = useColorScheme();
    expect(val).toBe('light');
  });
});
