import jwt from 'jsonwebtoken';
import User, { IUser } from '../../src/models/User';
import Product from '../../src/models/Product';
import RecentSearch from '../../src/models/RecentSearch';

export const createTestUser = async (userData: Partial<IUser> = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    ...userData
  };

  const user = await User.create(defaultUser);
  const token = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET || 'test-secret-key'
  );

  return { user, token };
};

export const generateAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});


// Add these if not already present
export const createTestProduct = async (userId: string) => {
  return await Product.create({
    title: 'Test Product',
    price: 100,
    condition: 'new',
    description: 'Test description',
    seller: userId,
    images: ['test-image.jpg']
  });
};

export const createTestRecentSearch = async (userId: string, data: any) => {
  return await RecentSearch.create({
    user: userId,
    ...data
  });
};
