// services/authStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_EXPIRATION_KEY = "authExpiration";

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
