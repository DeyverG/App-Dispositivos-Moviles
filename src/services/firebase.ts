import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getAuth, Auth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to remove quotes that might be parsed literally by Expo's env loader
const sanitizeEnv = (val: string | undefined): string => {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  databaseURL: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL),
  projectId: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
};

// Internal lazy instances
let appInstance: any = null;
let authInstance: Auth | null = null;
let databaseInstance: Database | null = null;

export const getFirebaseApp = () => {
  if (!appInstance) {
    const isFirstLoad = getApps().length === 0;
    appInstance = isFirstLoad ? initializeApp(firebaseConfig) : getApp();
  }
  return appInstance;
};

export const getFirebaseAuth = (): Auth => {
  if (!authInstance) {
    const app = getFirebaseApp();
    const isFirstLoad = getApps().length <= 1; // Since app was just retrieved, it should be the only one

    try {
      if (isFirstLoad) {
        // @ts-ignore
        authInstance = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } else {
        authInstance = getAuth(app);
      }
    } catch {
      authInstance = getAuth(app);
    }
  }
  return authInstance!;
};

export const getFirebaseDatabase = (): Database => {
  if (!databaseInstance) {
    const app = getFirebaseApp();
    databaseInstance = getDatabase(app);
  }
  return databaseInstance!;
};
