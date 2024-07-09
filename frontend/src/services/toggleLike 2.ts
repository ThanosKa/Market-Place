// In a new file, e.g., src/services/likes.ts

import axiosInstance from "./axiosConfig";

export const toggleLikeUser = async (userId: string): Promise<any> => {
  const response = await axiosInstance.post(`/likes/user/${userId}`);
  return response.data;
};

export const toggleLikeProduct = async (productId: string): Promise<any> => {
  const response = await axiosInstance.post(`/likes/product/${productId}`);
  return response.data;
};
