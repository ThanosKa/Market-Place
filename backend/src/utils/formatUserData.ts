export const formatUserData = (user: any) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  profilePicture: user.profilePicture || null,
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