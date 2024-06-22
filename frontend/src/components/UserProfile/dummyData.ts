// dummyData.ts
import { User, Product, Review } from "./types";

export const dummyUser: User = {
  firstName: "John",
  lastName: "Doe",
  profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
  reviews: 4.5,
  sales: 50,
  purchases: 30,
  location: "New York, USA",
};

export const dummyProducts: Product[] = [
  {
    id: 1,
    image: "https://via.placeholder.com/160x180",
    title: "Product 1",
    price: "$100",
    isLiked: false,
  },
  {
    id: 2,
    image: "https://via.placeholder.com/160x180",
    title: "Product 2",
    price: "$200",
    isLiked: false,
  },
  // Add more products as needed
];

export const dummyReviews: Review[] = [
  {
    id: 1,
    productImage: "https://via.placeholder.com/80x80",
    reviewerImage: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    itemName: "Vintage Camera",
    comment: "Great product, exactly as described!",
    reviewerName: "Jane Smith",
    purchaseDate: "2024-06-15",
  },
  {
    id: 2,
    productImage: "https://via.placeholder.com/80x80",
    reviewerImage: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 4,
    itemName: "Leather Jacket",
    comment: "Good quality, but slightly larger than expected.",
    reviewerName: "Mike Johnson",
    purchaseDate: "2024-06-10",
  },
  // Add more review objects as needed
];
