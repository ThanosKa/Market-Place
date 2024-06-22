// types.ts
export interface User {
  firstName: string;
  lastName: string;
  profileImage: string;
  reviews: number;
  sales: number;
  purchases: number;
  location: string;
}

export interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  isLiked: boolean;
}

export interface Review {
  id: number;
  productImage: string;
  reviewerImage: string;
  rating: number;
  itemName: string;
  comment: string;
  reviewerName: string;
  purchaseDate: string;
}
