// services/axiosConfig.ts
import axios from "axios";
import env from "../config/env";
import {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  removeAuthToken,
  removeRefreshToken,
} from "./authStorage";
import { navigate } from "../navigation/navigationRef";

const API_URL = `${env.PROTOCOL}://${env.SERVER}:${env.PORT}/${env.API_BASEPATH}`;
export const BASE_URL = `${env.PROTOCOL}://${env.SERVER}:${env.PORT}`;

if (!env.PROTOCOL || !env.SERVER || !env.PORT) {
  console.error("Environment variables are not set correctly");
}

const createAxiosInstance = (contentType: string) => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": contentType,
    },
  });

  instance.interceptors.request.use(
    async (config) => {
      const { token, expirationTime } = await getAuthToken();
      if (token && expirationTime && Date.now() < expirationTime) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
      }
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      console.error(
        `Error response from ${error.config.url}:`,
        error.response?.status
      );
      console.error("Error data:", error.response?.data);

      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          console.log("Attempting to refresh token");
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });
          const { access_token } = response.data.data;

          console.log("Token refreshed successfully");
          await setAuthToken(access_token);
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          await removeAuthToken();
          await removeRefreshToken();
          navigate("Auth");
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance("application/json");
export const axiosFormDataInstance = createAxiosInstance("multipart/form-data");

export default axiosInstance;
