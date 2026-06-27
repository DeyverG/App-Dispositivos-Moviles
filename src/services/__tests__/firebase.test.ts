/* eslint-disable */
import { getApps, initializeApp, getApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

describe('firebase service helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize firebase app on first load', () => {
    jest.isolateModules(() => {
      const { getFirebaseApp } = require('../firebase');
      (getApps as jest.Mock).mockReturnValue([]);
      const app = getFirebaseApp();
      expect(initializeApp).toHaveBeenCalled();
      expect(app).toBeDefined();
    });
  });

  it('should get existing firebase app if already initialized', () => {
    jest.isolateModules(() => {
      const { getFirebaseApp } = require('../firebase');
      (getApps as jest.Mock).mockReturnValue([{ name: 'existing' }]);
      const app = getFirebaseApp();
      expect(getApp).toHaveBeenCalled();
      expect(app).toBeDefined();
    });
  });

  it('should initialize auth on first load', () => {
    jest.isolateModules(() => {
      const { getFirebaseAuth } = require('../firebase');
      (getApps as jest.Mock).mockReturnValue([]);
      const auth = getFirebaseAuth();
      expect(initializeAuth).toHaveBeenCalled();
      expect(auth).toBeDefined();
    });
  });

  it('should get database instance', () => {
    jest.isolateModules(() => {
      const { getFirebaseDatabase } = require('../firebase');
      const db = getFirebaseDatabase();
      expect(getDatabase).toHaveBeenCalled();
      expect(db).toBeDefined();
    });
  });
});
