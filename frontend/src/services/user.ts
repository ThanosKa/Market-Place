import { User } from "../interfaces/user";
import axiosInstance, { axiosFormDataInstance } from "./axiosConfig";
import { UserDetailsResponse } from "../interfaces/user";

export interface ApiResponse {
  success: number;
  message: string;
  data: {
    user: User;
  };
}

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

export const getUserById = async (userId: string) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const getUserDetails = async (): Promise<UserDetailsResponse> => {
  const response = await axiosInstance.get<UserDetailsResponse>(
    "/users/details"
  );
  return response.data;
};

export const getAllUsersInfo = async (page = 1, limit = 10, search = "") => {
  if (!search) {
    return null;
  }
  const response = await axiosInstance.get("/users/info", {
    params: { page, limit, search },
  });
  return response.data;
};
