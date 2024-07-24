// In a new file, e.g., src/services/likes.ts

import { Product } from "../interfaces/product";
import { LikedUser } from "../interfaces/user";
import axiosInstance from "./axiosConfig";

export const toggleLikeUser = async (userId: string): Promise<any> => {
  const response = await axiosInstance.post(`/likes/user/${userId}`);
  return response.data;
};

export const toggleLikeProduct = async (productId: string): Promise<any> => {
  const response = await axiosInstance.post(`/likes/product/${productId}`);
  return response.data;
};

export const getLikedProducts = async (): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<{
      success: number;
      message: string;
      data: { likedProducts: Product[] };
    }>("/likes/products");
    const data = response.data.data.likedProducts;
    console.log("getLikedProducts", data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getLikedProfiles = async (): Promise<LikedUser[]> => {
  try {
    const response = await axiosInstance.get<{
      success: number;
      message: string;
      data: { likedUsers: LikedUser[] };
    }>("/likes/profiles");
    const data = response.data.data.likedUsers;
    console.log("getLikedProfiles", data);
    return data;
  } catch (error) {
    throw error;
  }
};
