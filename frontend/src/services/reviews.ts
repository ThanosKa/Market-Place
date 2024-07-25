import axiosInstance from "./axiosConfig";

export const getReviewsForUser = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }
) => {
  const response = await axiosInstance.get(`/reviews/user/${userId}`, {
    params,
  });
  return response.data;
};
export const getUserReviews = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}) => {
  const response = await axiosInstance.get("/reviews", { params });
  return response.data;
};
