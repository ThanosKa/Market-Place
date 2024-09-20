// interfaces/user.ts
import { Product } from "./product";
import { Review } from "./review";

export interface LikedUser {
  id: string;
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  likedProducts: string[];
  likedUsers: string[];
  products: Product[];
  updatedAt: string;
  averageRating: number;
  reviewCount: number;
  profilePicture: string;
}
export interface ActivityProduct {
  _id: string;
  title: string;
  images: string[];
  price: number;
}

export interface Activity {
  _id: string;
  user: string;
  type:
    | "message"
    | "product_like"
    | "profile_like"
    | "review_prompt"
    | "review"
    | "product_purchased";
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
  lastSentAt: string;
  reviewDone: string;
  reviewStatus: string;
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
  createdAt: string;
}

export interface UserResponse {
  data: {
    user: User;
  };
}

export interface UserDetailsResponse {
  success: number;
  message: string;
  data: {
    user: User;
    totalProducts: number;
    totalLikes: number;
  };
}
