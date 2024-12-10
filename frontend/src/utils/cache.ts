// src/utils/cache.ts
import * as SecureStore from 'expo-secure-store';
import { TokenCache } from '@clerk/clerk-expo/dist/cache';

export const tokenCache: TokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};
