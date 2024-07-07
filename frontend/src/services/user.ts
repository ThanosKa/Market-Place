// services/user.ts
import { UserResponse } from "../interfaces/user";
import axiosInstance from "./axiosConfig";

export const getLoggedUser = async (): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.get<UserResponse>("/users/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};
