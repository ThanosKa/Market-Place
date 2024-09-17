import axiosInstance from "./axiosConfig";

export const purchaseProduct = async (productId: string): Promise<any> => {
  const response = await axiosInstance.post(`/products/${productId}/purchase`);
  return response.data;
};
