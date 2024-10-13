import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_EXPIRATION_KEY = "authExpiration";
const USER_ID_KEY = "userId";

export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    // Set expiration time to 1 hour from now
    const expirationTime = Date.now() + 60 * 60 * 1000;
    await AsyncStorage.setItem(AUTH_EXPIRATION_KEY, expirationTime.toString());
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export const setRefreshToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting refresh token:", error);
  }
};

export const getAuthToken = async (): Promise<{
  token: string | null;
  expirationTime: number | null;
}> => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
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

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_EXPIRATION_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

export const removeRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error removing refresh token:", error);
  }
};

export const setUserId = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error("Error setting user ID:", error);
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

export const removeUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error removing user ID:", error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    const keys = [
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      AUTH_EXPIRATION_KEY,
      USER_ID_KEY,
    ];
    await AsyncStorage.multiRemove(keys);
    console.log("All auth-related data cleared successfully");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error; // Rethrow the error so the calling function can handle it if needed
  }
};
