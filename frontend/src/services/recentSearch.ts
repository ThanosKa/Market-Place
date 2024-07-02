import {
  AddRecentSearchResponse,
  RecentSearchesResponse,
  DeleteRecentSearchResponse,
  DeleteAllRecentSearchesResponse,
} from "../interfaces/recentSearch";
import axiosInstance from "./axiosConfig";

export const getRecentSearches = async (): Promise<RecentSearchesResponse> => {
  const response = await axiosInstance.get("/recent");
  return response.data;
};

export const addRecentSearch = async (data: {
  query: string;
  productId: string;
}): Promise<AddRecentSearchResponse> => {
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
