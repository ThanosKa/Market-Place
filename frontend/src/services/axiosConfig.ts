// services/axiosConfig.ts
import axios from "axios";
import env from "../config/env"; // Adjust the import path as necessary
import { getAuthToken } from "./authStorage";

const API_URL = `${env.PROTOCOL}://${env.SERVER}:${env.PORT}/${env.API_BASEPATH}`;
export const BASE_URL = `${env.PROTOCOL}://${env.SERVER}:${env.PORT}`;
console.log("BASE_URL:", BASE_URL);
if (!env.PROTOCOL || !env.SERVER || !env.PORT) {
  console.error("Environment variables are not set correctly");
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const axiosFormDataInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

axiosFormDataInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
