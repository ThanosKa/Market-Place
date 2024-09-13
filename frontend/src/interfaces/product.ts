export interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  description?: string; // Making this optional as it wasn't in the example response
  seller: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  likes: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number; // Version key from MongoDB, usually internal
  sold: {
    to: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture: string;
    };
    date: string;
  } | null; // Using null to indicate that the product might not be sold
}

export interface ProductsResponse {
  success: number;
  message: string;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetProductsParams {
  limit?: number;
  page?: number;
  search?: string;
  category?: string | string[];
  condition?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  order?: "asc" | "desc";
}
export interface PurchasedProductsResponse {
  success: number;
  message: string;
  data: {
    products: Product[];
    page: number;
    limit: number;
    totalPurchasedProducts: number;
    totalPages: number;
  };
}
export interface SoldProductsResponse {
  success: number;
  message: string;
  data: {
    products: Product[];
    page: number;
    limit: number;
    totalSoldProducts: number;
    totalPages: number;
  };
}

export interface UserProductsResponse {
  success: number;
  message: string;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    sort: string;
    order: "asc" | "desc";
  };
}

export interface GetUserProductsParams {
  limit?: number;
  page?: number;
  search?: string;
  category?: string | string[];
  condition?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  order?: "asc" | "desc";
}
