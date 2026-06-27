import { useTheme } from '../use-theme';
import { useColorScheme } from '../use-color-scheme';
import { Colors } from '../../constants/theme';

jest.mock('../use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('useTheme hook', () => {
  it('should return light theme colors when color scheme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const theme = useTheme();
    expect(theme).toEqual(Colors.light);
  });

  it('should return dark theme colors when color scheme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const theme = useTheme();
    expect(theme).toEqual(Colors.dark);
  });

  it('should return light theme colors when color scheme is unspecified', () => {
    (useColorScheme as jest.Mock).mockReturnValue('unspecified');
    const theme = useTheme();
    expect(theme).toEqual(Colors.light);
  });
});
