import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import { createTestUser, generateAuthHeader } from '../helpers/testHelpers';
import User from '../../src/models/User';
import Product, { CATEGORY_TYPES, CONDITION_TYPES } from '../../src/models/Product';
import RecentSearch from '../../src/models/RecentSearch';

describe('Recent Search API Endpoints', () => {
  let authToken: string;
  let userId: string;
  let searchedUserId: string;
  let productId: string;

  beforeEach(async () => {
    // Create main test user
    const { user, token } = await createTestUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    userId = user._id.toString();
    authToken = token;

    // Create a user to be searched
    const searchedUser = await User.create({
      email: 'searched@example.com',
      username: 'searcheduser',
      password: 'password123',
      firstName: 'Searched',
      lastName: 'User'
    });
    searchedUserId = searchedUser._id.toString();

    // Create a test product with correct enum values
    const product = await Product.create({
      title: 'Test Product',
      price: 100,
      condition: 'brandNew', // Using correct enum value from CONDITION_TYPES
      category: 'electronics', // Using correct enum value from CATEGORY_TYPES
      description: 'Test description',
      seller: userId,
      images: ['test-image.jpg'],
      likes: [],
      sold: null
    });
    productId = product._id.toString();
  });

  describe('POST /api/recent', () => {
    it('should add a new user search', async () => {
      const response = await request(app)
        .post('/api/recent')
        .set(generateAuthHeader(authToken))
        .send({
          query: 'test search',
          searchedUserId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.recentSearch).toHaveProperty('searchedUser');
      expect(response.body.data.recentSearch.searchedUser.username).toBe('searcheduser');
    });

    it('should add a new product search', async () => {
      const response = await request(app)
        .post('/api/recent')
        .set(generateAuthHeader(authToken))
        .send({
          query: 'test product',
          productId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.recentSearch).toHaveProperty('product');
      expect(response.body.data.recentSearch.product.title).toBe('Test Product');
    });

    it('should not allow searching for self', async () => {
      const response = await request(app)
        .post('/api/recent')
        .set(generateAuthHeader(authToken))
        .send({
          query: 'self search',
          searchedUserId: userId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
    });

    it('should require either productId or searchedUserId', async () => {
      const response = await request(app)
        .post('/api/recent')
        .set(generateAuthHeader(authToken))
        .send({
          query: 'invalid search'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
    });
  });

  describe('GET /api/recent', () => {
    beforeEach(async () => {
      // Create some test searches
      await RecentSearch.create([
        {
          user: userId,
          query: 'test search 1',
          searchedUser: searchedUserId
        },
        {
          user: userId,
          query: 'test search 2',
          product: productId
        }
      ]);
    });

    it('should get recent searches with pagination', async () => {
      const response = await request(app)
        .get('/api/recent')
        .set(generateAuthHeader(authToken))
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(Array.isArray(response.body.data.recentSearches)).toBe(true);
      expect(response.body.data.recentSearches.length).toBe(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should format searches correctly', async () => {
      const response = await request(app)
        .get('/api/recent')
        .set(generateAuthHeader(authToken));

      const searches = response.body.data.recentSearches;
      expect(searches[0]).toHaveProperty('type');
      expect(['user', 'product']).toContain(searches[0].type);
    });
  });

  describe('DELETE /api/recent/:id', () => {
    let searchId: string;

    beforeEach(async () => {
      const search = await RecentSearch.create({
        user: userId,
        query: 'test search',
        searchedUser: searchedUserId
      });
      searchId = search._id.toString();
    });

    it('should delete a specific search', async () => {
      const response = await request(app)
        .delete(`/api/recent/${searchId}`)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const searchExists = await RecentSearch.findById(searchId);
      expect(searchExists).toBeNull();
    });
  });

  describe('DELETE /api/recent/all', () => {
    beforeEach(async () => {
      await RecentSearch.create([
        {
          user: userId,
          query: 'test search 1',
          searchedUser: searchedUserId
        },
        {
          user: userId,
          query: 'test search 2',
          product: productId
        }
      ]);
    });

    it('should delete all searches for user', async () => {
      const response = await request(app)
        .delete('/api/recent/all')
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const remainingSearches = await RecentSearch.find({ user: userId });
      expect(remainingSearches.length).toBe(0);
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await RecentSearch.deleteMany({});
  });
});
