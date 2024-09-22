import { filePathToUrl } from "./filterToUrl";

export const formatUserData = (user: any, baseUrl: string) => ({
  id: user._id,
  email: user.email,
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
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const formatUserProfileData = (user: any, baseUrl: string) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  profilePicture: user.profilePicture
    ? filePathToUrl(user.profilePicture, baseUrl)
    : null,
  bio: user.bio || null,
  averageRating: user.averageRating,
  reviewCount: user.reviewCount,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
