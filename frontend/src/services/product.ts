import { GetProductsParams, ProductsResponse } from "../interfaces/product";
import axiosInstance from "./axiosConfig";
export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsResponse> => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );
    const response = await axiosInstance.get<ProductsResponse>("/products", {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
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

export const getProductById = async (productId: string) => {
  const response = await axiosInstance.get(`/products/${productId}`);
  return response.data;
};
