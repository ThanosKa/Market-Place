// tests/integration/activity.test.ts

import request from "supertest";
import app from "../../src/server";
import { createTestUser, generateAuthHeader } from "../helpers/testHelpers";
import Activity from "../../src/models/Activity";
import Product from "../../src/models/Product";
import { ActivityTypes } from "../../src/models/Activity";
import mongoose from "mongoose";

describe("Activity API Endpoints", () => {
  let authToken: string;
  let userId: string;
  let testActivity: any;
  let testProduct: any;

  beforeEach(async () => {
    // Create test user
    const { user, token } = await createTestUser({
      email: `user${Date.now()}@test.com`,
      username: `user${Date.now()}`,
    });
    userId = user._id.toString();
    authToken = token;

    // Create test product
    testProduct = await Product.create({
      title: "Test Product",
      price: 100,
      category: "electronics",
      condition: "brandNew",
      seller: userId,
      images: ["test.jpg"],
    });

    // Create test activity
    testActivity = await Activity.create({
      user: userId,
      type: ActivityTypes.PRODUCT_LIKE,
      sender: new mongoose.Types.ObjectId(),
      content: "Test activity content",
      product: testProduct._id,
      read: false,
    });
  });

  describe("GET /api/activities", () => {
    it("should get user activities with pagination", async () => {
      const response = await request(app)
        .get("/api/activities")
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.activities).toBeDefined();
      expect(Array.isArray(response.body.data.activities.items)).toBe(true);
      expect(response.body.data.activities.unseenCount).toBeDefined();
    });

    it("should respect pagination parameters", async () => {
      // Create multiple activities
      await Promise.all([
        Activity.create({
          user: userId,
          type: ActivityTypes.PRODUCT_LIKE,
          sender: new mongoose.Types.ObjectId(),
          content: "Activity 1",
        }),
        Activity.create({
          user: userId,
          type: ActivityTypes.PRODUCT_LIKE,
          sender: new mongoose.Types.ObjectId(),
          content: "Activity 2",
        }),
      ]);

      const response = await request(app)
        .get("/api/activities?page=1&limit=2")
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.data.activities.items.length).toBeLessThanOrEqual(2);
    });
  });

  describe("PUT /api/activities/:id/read", () => {
    it("should mark an activity as read", async () => {
      const response = await request(app)
        .put(`/api/activities/${testActivity._id}/read`)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const updatedActivity = await Activity.findById(testActivity._id);
      expect(updatedActivity?.read).toBe(true);
    });

    it("should return 404 for non-existent activity", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/activities/${fakeId}/read`)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/activities/mark-all-read", () => {
    it("should mark all user activities as read", async () => {
      // Create multiple unread activities
      await Promise.all([
        Activity.create({
          user: userId,
          type: ActivityTypes.PRODUCT_LIKE,
          sender: new mongoose.Types.ObjectId(),
          content: "Unread 1",
          read: false,
        }),
        Activity.create({
          user: userId,
          type: ActivityTypes.PRODUCT_LIKE,
          sender: new mongoose.Types.ObjectId(),
          content: "Unread 2",
          read: false,
        }),
      ]);

      const response = await request(app)
        .put("/api/activities/mark-all-read")
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const unreadCount = await Activity.countDocuments({
        user: userId,
        read: false,
      });
      expect(unreadCount).toBe(0);
    });
  });

  describe("DELETE /api/activities/:id", () => {
    it("should delete an activity", async () => {
      const response = await request(app)
        .delete(`/api/activities/${testActivity._id}`)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const deletedActivity = await Activity.findById(testActivity._id);
      expect(deletedActivity).toBeNull();
    });

    it("should return 404 for non-existent activity", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/activities/${fakeId}`)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/activities/review-prompt", () => {
    let buyerToken: string;
    let buyerId: string;
    let soldProduct: any;

    beforeEach(async () => {
      // Create buyer
      const { user: buyer, token } = await createTestUser({
        email: `buyer${Date.now()}@test.com`,
        username: `buyer${Date.now()}`,
      });
      buyerId = buyer._id.toString();
      buyerToken = token;

      // Create a sold product
      soldProduct = await Product.create({
        title: "Sold Product",
        price: 100,
        category: "electronics",
        condition: "brandNew",
        seller: userId,
        images: ["test.jpg"],
        sold: {
          to: buyerId,
          date: new Date(),
        },
      });
    });

    it("should create a review prompt activity", async () => {
      const response = await request(app)
        .post("/api/activities/review-prompt")
        .set(generateAuthHeader(authToken))
        .send({ productId: soldProduct._id });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);
      expect(response.body.data.activity).toBeDefined();
      expect(response.body.data.activity.type).toBe(
        ActivityTypes.REVIEW_PROMPT
      );
    });

    it("should not create duplicate review prompt if unread", async () => {
      // Create first review prompt
      await request(app)
        .post("/api/activities/review-prompt")
        .set(generateAuthHeader(authToken))
        .send({ productId: soldProduct._id });

      // Try to create another one
      const response = await request(app)
        .post("/api/activities/review-prompt")
        .set(generateAuthHeader(authToken))
        .send({ productId: soldProduct._id });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(0);
    });
  });
});
