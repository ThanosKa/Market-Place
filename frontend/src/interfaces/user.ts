import { Product } from "./product";

// types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  bio: string | null;
  likedProducts: string[];
  likedUsers: string[];
  products: Product[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: number;
  message: string;
  data: {
    user: User;
  };
}
