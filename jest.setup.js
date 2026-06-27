// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 4.6097, longitude: -74.0817 } })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 4.6097, longitude: -74.0817 } })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{ street: 'Calle 1', streetNumber: '1-1', city: 'Bogota' }])),
  Accuracy: { Balanced: 3 },
}));

// Mock expo-image
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props) => React.createElement(View, props),
  };
});

// Mock expo-symbols
jest.mock('expo-symbols', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SymbolView: (props) => React.createElement(View, props),
  };
});

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('mock-secure-value')),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MapView = (props) => React.createElement(View, props);
  const Marker = (props) => React.createElement(View, props);
  return {
    __esModule: true,
    default: MapView,
    Marker: Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(() => ({})),
    initializeAuth: jest.fn(() => ({})),
    getReactNativePersistence: jest.fn(() => ({})),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    updateProfile: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback({ uid: 'test-uid', email: 'test@example.com' });
      return jest.fn(); // unsubscribe function
    }),
  };
});

// Mock firebase/database
jest.mock('firebase/database', () => {
  return {
    getDatabase: jest.fn(() => ({})),
    ref: jest.fn(),
    set: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
    onValue: jest.fn((ref, callback) => {
      const snapshot = {
        val: () => ({
          'task-1': {
            id: 'task-1',
            title: 'Test Task 1',
            description: 'Desc 1',
            priority: 'media',
            completed: false,
            createdAt: 1000,
          },
        }),
      };
      callback(snapshot);
      return jest.fn(); // unsubscribe function
    }),
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: ({ children, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, props, children);
  },
  DarkTheme: {},
  DefaultTheme: {},
  ThemeProvider: ({ children }) => children,
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-crypto-uuid'),
}));

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  scheduleOnRN: jest.fn((fn, ...args) => fn(...args)),
  createSerializable: jest.fn((val) => val),
}));

// Custom mock for react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const mockView = React.forwardRef((props, ref) => {
    const { entering, exiting, layout, ...rest } = props;
    return React.createElement(View, { ...rest, ref });
  });
  const mockText = React.forwardRef((props, ref) => {
    const { entering, exiting, layout, ...rest } = props;
    return React.createElement(Text, { ...rest, ref });
  });
  return {
    default: {
      View: mockView,
      Text: mockText,
      createAnimatedComponent: (c) => c,
    },
    View: mockView,
    Text: mockText,
    Easing: {
      elastic: () => ({}),
      linear: () => ({}),
      ease: () => ({}),
      bezier: () => ({}),
    },
    Keyframe: class Keyframe {
      constructor() {}
      duration() { return this; }
      withCallback() { return this; }
    },
    useSharedValue: (val) => ({ value: val }),
    useAnimatedStyle: (fn) => fn(),
    withTiming: (val) => val,
    withSpring: (val) => val,
  };
});

// Globally spy on useColorScheme in react-native
try {
  const RN = require('react-native');
  jest.spyOn(RN, 'useColorScheme').mockImplementation(() => 'light');
} catch (e) {
  // Silent fallback
}
