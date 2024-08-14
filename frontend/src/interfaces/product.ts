export interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  description: string;
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
