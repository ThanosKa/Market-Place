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
  purchaseRequest?: {
    buyer: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture: string;
    };
    date: string;
    status: "pending" | "accepted" | "rejected";
  };
}
export type ActivityType =
  | "message"
  | "product_like"
  | "profile_like"
  | "review_prompt"
  | "review"
  | "product_purchased"
  | "purchase_request"
  | "purchase_request_accepted"
  | "purchase_request_cancelled";

export interface Activity {
  _id: string;
  user: string;
  type: ActivityType;
  sender: {
    username: string;
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
  balance: number;
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
