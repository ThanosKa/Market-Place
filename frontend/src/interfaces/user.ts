// interfaces/user.ts
import { Product } from "./product";
import { Review } from "./review";

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
export interface ActivityProduct {
  _id: string;
  title: string;
  images: string[];
}

export interface Activity {
  _id: string;
  user: string;
  type: "message" | "product_like" | "profile_like";
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
  __v: number;
  product?: ActivityProduct;
}

export interface Activities {
  items: Activity[];
  unseenCount: number;
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
  reviews: Review[];
  activities: Activities;
  updatedAt: string;
}

export interface UserResponse {
  data: {
    user: User;
  };
}
