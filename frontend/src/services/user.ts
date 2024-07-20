import { User } from "../interfaces/user";
import axiosInstance, { axiosFormDataInstance } from "./axiosConfig";

export interface ApiResponse {
  success: number;
  message: string;
  data: {
    user: User;
  };
}

// Get logged-in user
export const getLoggedUser = async (params?: {
  search?: string;
  category?: string | string[];
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<ApiResponse> => {
  try {
    let url = "/users/me";
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await axiosInstance.get<ApiResponse>(url);
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
    console.error("Error editing user:", error);
    return null; // Return null instead of throwing
  }
};

// Get user by ID
// services/user.ts
export const getUserById = async (
  userId: string,
  params?: {
    search?: string;
    category?: string | string[];
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
  }
): Promise<ApiResponse> => {
  try {
    let url = `/users/${userId}`;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [
          string,
          string
        ][]
      ).toString();
      url += `?${queryString}`;
    }
    const response = await axiosInstance.get<ApiResponse>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};
