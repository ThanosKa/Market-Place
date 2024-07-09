import { User } from "../interfaces/user";
import axiosInstance from "./axiosConfig";

interface ApiResponse {
  success: number;
  message: string;
  data: {
    user: User;
  };
}

// Get logged-in user
export const getLoggedUser = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>("/users/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(
      `/api/users/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
