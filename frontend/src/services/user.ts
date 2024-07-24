import { User } from "../interfaces/user";
import axiosInstance, { axiosFormDataInstance } from "./axiosConfig";

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

interface UserDetailsResponse {
  success: number;
  message: string;
  data: {
    user: User;
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
}

export const getUserDetails = async () => {
  const response = await axiosInstance.get("/users/details");
  return response.data;
};

export const getUserProducts = async (params?: {
  search?: string;
  category?: string | string[];
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}) => {
  const response = await axiosInstance.get("/products/user", { params });
  return response.data;
};

export const getUserReviews = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}) => {
  const response = await axiosInstance.get("/reviews", { params });
  return response.data;
};

export const getUserProductsById = async (
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
) => {
  const response = await axiosInstance.get(`/products/user/${userId}`, {
    params,
  });
  return response.data;
};

export const getReviewsForUser = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }
) => {
  const response = await axiosInstance.get(`/reviews/user/${userId}`, {
    params,
  });
  return response.data;
};
