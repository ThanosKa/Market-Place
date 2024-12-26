import { IUser } from "../../src/models/User";

export const validUserData: Partial<IUser> = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  bio: 'Test bio'
};

export const updateUserData: Partial<IUser> = {
  firstName: 'Updated',
  lastName: 'Name',
  bio: 'Updated bio'
};
