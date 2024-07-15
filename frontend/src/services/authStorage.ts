// services/authStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_EXPIRATION_KEY = "authExpiration";
const USER_ID_KEY = "userId";

export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    // Set expiration time to 1 hour from now (matching backend expiration)
    const expirationTime = Date.now() + 60 * 60 * 1000;
    await AsyncStorage.setItem(AUTH_EXPIRATION_KEY, expirationTime.toString());
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export const getAuthToken = async (): Promise<{
  token: string | null;
  expirationTime: number | null;
}> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const expirationTime = await AsyncStorage.getItem(AUTH_EXPIRATION_KEY);
    return {
      token,
      expirationTime: expirationTime ? parseInt(expirationTime, 10) : null,
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    return { token: null, expirationTime: null };
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_EXPIRATION_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

// New method to save userId
export const setUserId = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error("Error setting user ID:", error);
  }
};

// New method to get userId
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

// New method to remove userId
export const removeUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error removing user ID:", error);
  }
};
