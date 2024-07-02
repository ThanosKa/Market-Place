// interfaces/recentSearch.ts

import { Product } from "./product";

export interface RecentSearchProduct {
  _id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
}

export interface RecentSearch {
  _id: string;
  user: string;
  query: string;
  product: Product;
  createdAt: string;
}

export interface RecentSearchesResponse {
  success: number;
  message: string;
  data: {
    recentSearches: RecentSearch[];
  };
}

export interface AddRecentSearchResponse {
  success: number;
  message: string;
  data: {
    recentSearch: {
      user: string;
      query: string;
      product: string;
      _id: string;
      createdAt: string;
    };
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
