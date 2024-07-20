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
