import jwt from 'jsonwebtoken';
import User, { IUser } from '../../src/models/User';

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
