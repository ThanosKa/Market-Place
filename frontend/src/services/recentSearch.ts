import {
  AddRecentSearchResponse,
  RecentSearchesResponse,
  DeleteRecentSearchResponse,
  DeleteAllRecentSearchesResponse,
} from "../interfaces/recentSearch";
import axiosInstance from "./axiosConfig";

export const getRecentSearches = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await axiosInstance.get("/recent", { params });
  return response.data;
};

type AddRecentSearchPayload = {
  query: string;
  productId?: string;
  searchedUserId?: string;
};

// Update the service function
export const addRecentSearch = async (
  data: AddRecentSearchPayload
): Promise<AddRecentSearchResponse> => {
  const response = await axiosInstance.post("/recent", data);
  return response.data;
};

export const deleteRecentSearch = async (
  id: string
): Promise<DeleteRecentSearchResponse> => {
  const response = await axiosInstance.delete(`/recent/${id}`);
  return response.data;
};

export const deleteAllRecentSearches =
  async (): Promise<DeleteAllRecentSearchesResponse> => {
    const response = await axiosInstance.delete("/recent/all");
    return response.data;
  };
