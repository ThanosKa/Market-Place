import { AxiosResponse } from "axios";
import {
  GetProductsParams,
  GetUserProductsParams,
  Product,
  ProductsResponse,
  PurchasedProductsResponse,
  SoldProductsResponse,
  UserProductsResponse,
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
    const response = await axiosInstance.get<ProductsResponse>("/products", {
      params: {
        ...params,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProducts = async (
  params: GetUserProductsParams = {}
): Promise<UserProductsResponse> => {
  try {
    const response = await axiosInstance.get<UserProductsResponse>(
      "/products/user",
      {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProductsById = async (
  userId: string,
  params: GetUserProductsParams = {}
): Promise<UserProductsResponse> => {
  try {
    const response = await axiosInstance.get<UserProductsResponse>(
      `/products/user/${userId}`,
      {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
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
