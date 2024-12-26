import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import { createTestUser, generateAuthHeader } from "../helpers/testHelpers";
import User from "../../src/models/User";
import Product from "../../src/models/Product";
import Review from "../../src/models/Review";
import Activity from "../../src/models/Activity";

const REVIEW_ROUTES = {
  BASE: "/api/reviews",
  CREATE: "/api/reviews",
  GET_MY_REVIEWS: "/api/reviews",
  GET_USER_REVIEWS: (userId: string) => `/api/reviews/user/${userId}`,
  GET_DONE_BY_USER: (userId: string) => `/api/reviews/done-by/${userId}`,
  UPDATE: (reviewId: string) => `/api/reviews/${reviewId}`,
  DELETE: (reviewId: string) => `/api/reviews/${reviewId}`,
};

describe("Review API Endpoints", () => {
  let authToken: string;
  let reviewerId: string;
  let revieweeId: string;
  let productId: string;
  let reviewId: string;

  beforeEach(async () => {
    // Create reviewer
    const { user: reviewer, token } = await createTestUser({
      email: "reviewer@test.com",
      username: "reviewer",
      password: "password123",
      firstName: "Reviewer",
      lastName: "Test",
    });
    reviewerId = reviewer._id.toString();
    authToken = token;

    // Create reviewee with initial stats
    const { user: reviewee } = await createTestUser({
      email: "reviewee@test.com",
      username: "reviewee",
      password: "password123",
      firstName: "Reviewee",
      lastName: "Test",
    });
    revieweeId = reviewee._id.toString();

    // Create test product
    const product = await Product.create({
      title: "Test Product",
      price: 100,
      condition: "brandNew",
      category: "electronics",
      description: "Test description",
      seller: revieweeId,
      images: ["test-image.jpg"],
      likes: [],
    });
    productId = product._id.toString();
  });

  describe("POST /api/reviews", () => {
    it("should create a new review", async () => {
      const response = await request(app)
        .post(REVIEW_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .send({
          revieweeId,
          productId,
          rating: 4,
          comment: "Great product and seller!",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);
      expect(response.body.data.review.rating).toBe(4);
      expect(response.body.data.review.comment).toBe(
        "Great product and seller!"
      );

      // Verify user stats update
      const updatedReviewee = await User.findById(revieweeId);
      expect(updatedReviewee?.reviewCount).toBe(1);
      expect(updatedReviewee?.averageRating).toBe(4);

      // Verify activity creation
      const activity = await Activity.findOne({
        user: revieweeId,
        type: "review",
      });
      expect(activity).toBeTruthy();
    });

    it("should not allow self-review", async () => {
      // Create a product owned by the reviewer
      const ownProduct = await Product.create({
        title: "Own Product",
        price: 100,
        condition: "brandNew",
        category: "electronics",
        description: "Test description",
        seller: reviewerId,
        images: ["test-image.jpg"],
        likes: [],
      });

      const response = await request(app)
        .post(REVIEW_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .send({
          revieweeId: reviewerId,
          productId: ownProduct._id,
          rating: 5,
          comment: "Self review attempt",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toBe("You cannot review yourself");
    });

    it("should validate rating range", async () => {
      const response = await request(app)
        .post(REVIEW_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .send({
          revieweeId,
          productId,
          rating: 6,
          comment: "Invalid rating",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
    });

    it("should not allow duplicate reviews", async () => {
      // Create initial review
      await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        product: productId,
        rating: 4,
        comment: "Initial review",
      });

      const response = await request(app)
        .post(REVIEW_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .send({
          revieweeId,
          productId,
          rating: 5,
          comment: "Duplicate review",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toBe(
        "You have already reviewed this product for this user"
      );
    });
  });

  describe("GET /api/reviews", () => {
    beforeEach(async () => {
      // Create reviews where logged user is reviewee
      await Review.create([
        {
          reviewer: revieweeId,
          reviewee: reviewerId,
          product: productId,
          rating: 4,
          comment: "Review 1",
        },
        {
          reviewer: revieweeId,
          reviewee: reviewerId,
          product: productId,
          rating: 5,
          comment: "Review 2",
        },
      ]);
    });

    it("should get reviews for logged-in user with pagination", async () => {
      const response = await request(app)
        .get(REVIEW_ROUTES.GET_MY_REVIEWS)
        .set(generateAuthHeader(authToken))
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.reviews).toHaveLength(2);
      expect(response.body.data).toHaveProperty("totalReviews");
      expect(response.body.data).toHaveProperty("totalPages");
    });

    it("should properly format review responses", async () => {
      const response = await request(app)
        .get(REVIEW_ROUTES.GET_MY_REVIEWS)
        .set(generateAuthHeader(authToken));

      const review = response.body.data.reviews[0];
      expect(review).toHaveProperty("reviewer");
      expect(review).toHaveProperty("product");
      expect(review.reviewer).toHaveProperty("username");
      expect(review.product).toHaveProperty("title");
    });
  });

  describe("GET /api/reviews/user/:userId", () => {
    beforeEach(async () => {
      await Review.create([
        {
          reviewer: reviewerId,
          reviewee: revieweeId,
          product: productId,
          rating: 4,
          comment: "Review for user",
        },
      ]);
    });

    it("should get reviews for specific user", async () => {
      const response = await request(app)
        .get(REVIEW_ROUTES.GET_USER_REVIEWS(revieweeId))
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.reviews[0].reviewee).toBe(revieweeId);
    });

    it("should handle non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(
        REVIEW_ROUTES.GET_USER_REVIEWS(fakeId.toString())
      );

      expect(response.status).toBe(200);
      expect(response.body.data.reviews).toHaveLength(0);
    });
  });

  describe("GET /api/reviews/done-by/:userId", () => {
    beforeEach(async () => {
      await Review.create([
        {
          reviewer: reviewerId,
          reviewee: revieweeId,
          product: productId,
          rating: 4,
          comment: "Review done by user",
        },
      ]);
    });

    it("should get reviews done by specific user", async () => {
      const response = await request(app)
        .get(REVIEW_ROUTES.GET_DONE_BY_USER(reviewerId))
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.reviews[0].reviewer).toBe(reviewerId);
    });
  });

  describe("PUT /api/reviews/:reviewId", () => {
    beforeEach(async () => {
      const review = await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        product: productId,
        rating: 3,
        comment: "Initial review",
      });
      reviewId = review._id.toString();

      // Set initial stats
      await User.findByIdAndUpdate(revieweeId, {
        reviewCount: 1,
        averageRating: 3,
      });
    });

    it("should update an existing review", async () => {
      const response = await request(app)
        .put(REVIEW_ROUTES.UPDATE(reviewId))
        .set(generateAuthHeader(authToken))
        .send({
          rating: 5,
          comment: "Updated review",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.review.rating).toBe(5);
      expect(response.body.data.review.comment).toBe("Updated review");

      const updatedReviewee = await User.findById(revieweeId);
      expect(updatedReviewee?.reviewCount).toBe(1);
      expect(updatedReviewee?.averageRating).toBe(5);
    });

    it("should validate rating on update", async () => {
      const invalidRatings = [0, 6, 2.5, -1];

      for (const invalidRating of invalidRatings) {
        const response = await request(app)
          .put(REVIEW_ROUTES.UPDATE(reviewId))
          .set(generateAuthHeader(authToken))
          .send({
            rating: invalidRating,
            comment: "Invalid rating",
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(0);
        expect(response.body.message).toBe(
          "Rating must be an integer between 1 and 5"
        );
      }
    });

    it("should allow updating only comment", async () => {
      const response = await request(app)
        .put(REVIEW_ROUTES.UPDATE(reviewId))
        .set(generateAuthHeader(authToken))
        .send({
          comment: "Only comment updated",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.review.rating).toBe(3); // Original rating
      expect(response.body.data.review.comment).toBe("Only comment updated");

      // Check that average rating hasn't changed
      const reviewee = await User.findById(revieweeId);
      expect(reviewee?.averageRating).toBe(3);
    });

    it("should not allow updating someone else's review", async () => {
      const { token: otherToken } = await createTestUser({
        email: "other@test.com",
        username: "other",
        password: "password123",
      });

      const response = await request(app)
        .put(REVIEW_ROUTES.UPDATE(reviewId))
        .set(generateAuthHeader(otherToken))
        .send({
          rating: 1,
          comment: "Unauthorized update",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(0);
    });

    it("should handle non-existent review", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(REVIEW_ROUTES.UPDATE(fakeId.toString()))
        .set(generateAuthHeader(authToken))
        .send({
          rating: 4,
          comment: "Update non-existent review",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(0);
    });
  });

  describe("DELETE /api/reviews/:reviewId", () => {
    beforeEach(async () => {
      const review = await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        product: productId,
        rating: 4,
        comment: "Review to delete",
      });
      reviewId = review._id.toString();

      // Set initial stats
      await User.findByIdAndUpdate(revieweeId, {
        reviewCount: 1,
        averageRating: 4,
      });
    });

    it("should delete a review and update stats", async () => {
      const response = await request(app)
        .delete(REVIEW_ROUTES.DELETE(reviewId))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      // Verify review deletion
      const deletedReview = await Review.findById(reviewId);
      expect(deletedReview).toBeNull();

      // Verify user stats update
      const updatedReviewee = await User.findById(revieweeId);
      expect(updatedReviewee?.reviewCount).toBe(0);
      expect(updatedReviewee?.averageRating).toBe(0);
    });

    it("should not allow deleting someone else's review", async () => {
      const { token: otherToken } = await createTestUser({
        email: "other@test.com",
        username: "other",
      });

      const response = await request(app)
        .delete(REVIEW_ROUTES.DELETE(reviewId))
        .set(generateAuthHeader(otherToken));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(0);
    });

    it("should handle non-existent review", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(REVIEW_ROUTES.DELETE(fakeId.toString()))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(0);
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Activity.deleteMany({});
  });
});
