// interfaces/review.ts
import { Product } from "./product";

export interface Reviewer {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface Review {
  _id: string;
  reviewer: Reviewer;
  reviewee: string;
  product: Product;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
