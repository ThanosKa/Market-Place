// interfaces/recentSearch.ts

export interface RecentSearchProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
}

export interface RecentSearchUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string | null;
  averageRating: number;
  reviewCount: number;
}

export interface BaseRecentSearch {
  id: string;
  query: string;
  createdAt: string;
}

export interface ProductRecentSearch extends BaseRecentSearch {
  type: 'product';
  product: RecentSearchProduct;
}

export interface UserRecentSearch extends BaseRecentSearch {
  type: 'user';
  user: RecentSearchUser;
}

export type RecentSearch = ProductRecentSearch | UserRecentSearch;

export interface RecentSearchesResponse {
  success: number;
  message: string;
  data: {
    recentSearches: RecentSearch[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AddRecentSearchResponse {
  success: number;
  message: string;
  data: {
    recentSearch: RecentSearch;
  };
}

export interface DeleteRecentSearchResponse {
  success: number;
  message: string;
  data: {
    deletedSearch: RecentSearch;
  };
}

export interface DeleteAllRecentSearchesResponse {
  success: number;
  message: string;
  data: null;
}
