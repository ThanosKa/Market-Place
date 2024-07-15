import { User } from "../interfaces/user";
import axiosInstance, { axiosFormDataInstance } from "./axiosConfig";

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
export const editUser = async (
  formData: FormData
): Promise<ApiResponse | null> => {
  try {
    const response = await axiosFormDataInstance.put<ApiResponse>(
      "/users",
      formData
    );
    return response.data;
  } catch (error) {
    // console.error("Error editing user:", error);
    return null; // Return null instead of throwing
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
