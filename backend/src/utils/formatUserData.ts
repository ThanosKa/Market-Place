import { filePathToUrl } from "./filterToUrl";

export const formatUserData = (user: any, baseUrl: string) => ({
  id: user._id,
  email: user.email,
  username: user.username, // Add username field
  firstName: user.firstName,
  lastName: user.lastName,
  profilePicture: user.profilePicture
    ? filePathToUrl(user.profilePicture, baseUrl)
    : null,
  bio: user.bio || null,
  likedProducts: user.likedProducts || [],
  likedUsers: user.likedUsers || [],
  products: user.products || [],
  averageRating: user.averageRating,
  reviewCount: user.reviewCount,
  reviews: user.reviews || [],
  activities: user.activities || [],
  balance: user.balance || 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const formatUserProfileData = (user: any, baseUrl: string) => ({
  id: user._id,
  email: user.email,
  username: user.username, // Add username field
  firstName: user.firstName,
  lastName: user.lastName,
  profilePicture: user.profilePicture
    ? filePathToUrl(user.profilePicture, baseUrl)
    : null,
  bio: user.bio || null,
  averageRating: user.averageRating,
  reviewCount: user.reviewCount,
  balance: user.balance || 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
