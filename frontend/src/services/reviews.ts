import axiosInstance from "./axiosConfig";
interface CreateReviewPayload {
  revieweeId: string;
  productId: string;
  rating: number;
  comment: string;
}
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

export const createReview = async (payload: CreateReviewPayload) => {
  try {
    const response = await axiosInstance.post("/reviews", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};
