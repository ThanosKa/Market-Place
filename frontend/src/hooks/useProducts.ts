// hooks/useProducts.ts
import { useQuery } from "react-query";
import { GetProductsParams, ProductsResponse } from "../interfaces/product";
import { getProducts } from "../services/product";

export const useProducts = (params: GetProductsParams = {}) => {
  return useQuery<ProductsResponse, Error>(
    ["products", params],
    () => getProducts(params),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};
