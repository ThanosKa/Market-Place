import request from 'supertest';
import { createTestUser, generateAuthHeader } from '../helpers/testHelpers';
import { validUserData, updateUserData } from '../fixtures/userData';
import mongoose from 'mongoose';
import app from '../../src/server';
import { IUser } from '../../src/models/User';

describe('User API Endpoints', () => {
  let authToken: string;
  let userId: string;
  let testUser: IUser;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    testUser = user;
    userId = user._id.toString();
    authToken = token;
  });

  describe('GET /api/users', () => {
    it('should get all users when authenticated', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(Array.isArray(response.body.data.users)).toBeTruthy();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.user.email).toBe(validUserData.email);
    });
  });

  describe('PUT /api/users', () => {
    it('should update user details', async () => {
      const response = await request(app)
        .put('/api/users')
        .set(generateAuthHeader(authToken))
        .send(updateUserData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.user.firstName).toBe(updateUserData.firstName);
      expect(response.body.data.user.lastName).toBe(updateUserData.lastName);
    });
  });
});
