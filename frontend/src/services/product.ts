import { GetProductsParams, ProductsResponse } from "../interfaces/product";
import axiosInstance from "./axiosConfig";

export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsResponse> => {
  try {
    const response = await axiosInstance.get<ProductsResponse>("/products", {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
