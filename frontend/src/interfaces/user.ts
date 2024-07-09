import { Product } from "./product";
// import { Review } from "./reviews";

export interface LikedUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  likedProducts: string[];
  likedUsers: string[];
  products: string[];
  updatedAt: string;
  averageRating: number;
  reviewCount: number;
}
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  bio: string | null;
  likedProducts: Product[];
  likedUsers: LikedUser[];
  products: Product[];
  averageRating: number;
  reviewCount: number;
  // reviews: Review[];
  reviews: any[];

  updatedAt: string;
}

export interface UserResponse {
  data: {
    user: User;
  };
}
