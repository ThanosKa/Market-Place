// hooks/useUserById.ts
import { useQuery, UseQueryOptions, QueryKey } from "react-query";
import { ApiResponse, getUserById } from "../services/user";

interface UserByIdParams {
  search?: string;
  category?: string | string[];
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

type UserByIdQueryKey = ["userById", string, UserByIdParams | undefined];

export const useUserById = (
  userId: string,
  params?: UserByIdParams,
  options?: Omit<
    UseQueryOptions<ApiResponse, Error, ApiResponse, UserByIdQueryKey>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ApiResponse, Error, ApiResponse, UserByIdQueryKey>(
    ["userById", userId, params],
    () => getUserById(userId, params),
    options
  );
};
