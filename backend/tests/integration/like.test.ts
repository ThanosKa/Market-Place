import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import { createTestUser, generateAuthHeader } from "../helpers/testHelpers";
import User from "../../src/models/User";
import Product from "../../src/models/Product";
import Activity from "../../src/models/Activity";

const LIKE_ROUTES = {
  TOGGLE_PRODUCT: (productId: string) => `/api/likes/product/${productId}`,
  TOGGLE_USER: (userId: string) => `/api/likes/user/${userId}`,
  GET_LIKED_PRODUCTS: "/api/likes/products",
  GET_LIKED_PROFILES: "/api/likes/profiles",
};

describe("Like API Endpoints", () => {
  let authToken: string;
  let userId: string;
  let otherUserId: string;
  let productId: string;

  beforeEach(async () => {
    // Create main user
    const { user, token } = await createTestUser({
      email: "user@test.com",
      username: "user",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    userId = user._id.toString();
    authToken = token;

    // Create another user
    const { user: otherUser } = await createTestUser({
      email: "other@test.com",
      username: "other",
      password: "password123",
      firstName: "Other",
      lastName: "User",
    });
    otherUserId = otherUser._id.toString();

    // Create test product
    const product = await Product.create({
      title: "Test Product",
      price: 100,
      condition: "brandNew",
      category: "electronics",
      description: "Test description",
      seller: otherUserId,
      images: ["test-image.jpg"],
      likes: [],
    });
    productId = product._id.toString();
  });

  describe("POST /api/likes/product/:productId", () => {
    it("should like a product", async () => {
      const response = await request(app)
        .post(LIKE_ROUTES.TOGGLE_PRODUCT(productId))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.liked).toBe(true);

      // Verify product likes
      const product = await Product.findById(productId);
      expect(product?.likes).toContainEqual(
        new mongoose.Types.ObjectId(userId)
      );

      // Verify user liked products
      const user = await User.findById(userId);
      expect(user?.likedProducts).toContainEqual(
        new mongoose.Types.ObjectId(productId)
      );

      // Verify activity creation
      const activity = await Activity.findOne({
        user: otherUserId,
        type: "product_like",
        sender: userId,
      });
      expect(activity).toBeTruthy();
    });

    it("should unlike a product", async () => {
      // First like the product
      await request(app)
        .post(LIKE_ROUTES.TOGGLE_PRODUCT(productId))
        .set(generateAuthHeader(authToken));

      // Then unlike it
      const response = await request(app)
        .post(LIKE_ROUTES.TOGGLE_PRODUCT(productId))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.liked).toBe(false);

      // Verify product likes removed
      const product = await Product.findById(productId);
      expect(product?.likes).not.toContainEqual(
        new mongoose.Types.ObjectId(userId)
      );

      // Verify activity removal
      const activity = await Activity.findOne({
        user: otherUserId,
        type: "product_like",
        sender: userId,
      });
      expect(activity).toBeNull();
    });

    it("should handle non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(LIKE_ROUTES.TOGGLE_PRODUCT(fakeId.toString()))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(0);
    });
  });

  describe("POST /api/likes/user/:likedUserId", () => {
    it("should like a user", async () => {
      const response = await request(app)
        .post(LIKE_ROUTES.TOGGLE_USER(otherUserId))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.liked).toBe(true);

      // Verify user liked users
      const user = await User.findById(userId);
      expect(user?.likedUsers).toContainEqual(
        new mongoose.Types.ObjectId(otherUserId)
      );

      // Verify activity creation
      const activity = await Activity.findOne({
        user: otherUserId,
        type: "profile_like",
        sender: userId,
      });
      expect(activity).toBeTruthy();
    });

    it("should not allow self-like", async () => {
      const response = await request(app)
        .post(LIKE_ROUTES.TOGGLE_USER(userId))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toBe("You cannot like yourself");
    });

    it("should unlike a user", async () => {
      // First like the user
      await request(app)
        .post(LIKE_ROUTES.TOGGLE_USER(otherUserId))
        .set(generateAuthHeader(authToken));

      // Then unlike
      const response = await request(app)
        .post(LIKE_ROUTES.TOGGLE_USER(otherUserId))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.liked).toBe(false);

      // Verify activity removal
      const activity = await Activity.findOne({
        user: otherUserId,
        type: "profile_like",
        sender: userId,
      });
      expect(activity).toBeNull();
    });
  });

  describe("GET /api/likes/products", () => {
    beforeEach(async () => {
      // Like a product first
      await request(app)
        .post(LIKE_ROUTES.TOGGLE_PRODUCT(productId))
        .set(generateAuthHeader(authToken));
    });

    it("should get liked products", async () => {
      const response = await request(app)
        .get(LIKE_ROUTES.GET_LIKED_PRODUCTS)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.likedProducts).toHaveLength(1);
      expect(response.body.data.likedProducts[0].title).toBe("Test Product");
    });
  });

  describe("GET /api/likes/profiles", () => {
    beforeEach(async () => {
      // Like a user first
      await request(app)
        .post(LIKE_ROUTES.TOGGLE_USER(otherUserId))
        .set(generateAuthHeader(authToken));
    });

    it("should get liked profiles", async () => {
      const response = await request(app)
        .get(LIKE_ROUTES.GET_LIKED_PROFILES)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.likedUsers).toHaveLength(1);
      expect(response.body.data.likedUsers[0].username).toBe("other");
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Activity.deleteMany({});
  });
});
