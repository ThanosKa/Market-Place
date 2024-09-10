import { AxiosResponse } from "axios";
import {
  GetProductsParams,
  Product,
  ProductsResponse,
  PurchasedProductsResponse,
  SoldProductsResponse,
} from "../interfaces/product";
import axiosInstance from "./axiosConfig";

export const createProduct = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsResponse> => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries({
        ...params,
        minPrice: params.minPrice || undefined,
        maxPrice: params.maxPrice || undefined,
        order: params.order || undefined,
        condition: params.condition || undefined,
      }).filter(([_, v]) => v != null && v !== "")
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
export const deleteProduct = async (productId: string) => {
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
};

export const updateProduct = async ({
  productId,
  ...updatedData
}: { productId: string } & Partial<Product>) => {
  const response = await axiosInstance.put(
    `/products/${productId}`,
    updatedData
  );
  return response.data;
};

export const getPurchasedProducts = async (
  page: number = 1,
  limit: number = 10
): Promise<PurchasedProductsResponse> => {
  try {
    const response: AxiosResponse<PurchasedProductsResponse> =
      await axiosInstance.get("/products/user/purchased", {
        params: { page, limit },
      });
    return response.data;
  } catch (error) {
    console.error("Error fetching purchased products:", error);
    throw error;
  }
};

export const getSoldProducts = async (
  page: number = 1,
  limit: number = 10
): Promise<SoldProductsResponse> => {
  try {
    const response: AxiosResponse<SoldProductsResponse> =
      await axiosInstance.get("/products/user/sold", {
        params: { page, limit },
      });
    return response.data;
  } catch (error) {
    console.error("Error fetching sold products:", error);
    throw error;
  }
};
