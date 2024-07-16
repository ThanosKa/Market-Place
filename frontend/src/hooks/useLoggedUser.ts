import { useQuery, UseQueryOptions, QueryKey } from "react-query";
import { ApiResponse, getLoggedUser } from "../services/user";

interface LoggedUserParams {
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

type LoggedUserQueryKey = ["loggedUser", LoggedUserParams | undefined];

export const useLoggedUser = (
  params?: LoggedUserParams,
  options?: Omit<
    UseQueryOptions<ApiResponse, Error, ApiResponse, LoggedUserQueryKey>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ApiResponse, Error, ApiResponse, LoggedUserQueryKey>(
    ["loggedUser", params],
    () => getLoggedUser(params),
    options
  );
};
