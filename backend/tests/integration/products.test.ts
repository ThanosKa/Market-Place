import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/server";
import { createTestUser, generateAuthHeader } from "../helpers/testHelpers";
import User from "../../src/models/User";
import Product, {
  CATEGORY_TYPES,
  CONDITION_TYPES,
} from "../../src/models/Product";
import Activity from "../../src/models/Activity";
import path from "path";
import fs from "fs";

const PRODUCT_ROUTES = {
  CREATE: "/api/products",
  GET_ALL: "/api/products",
  GET_USER_PRODUCTS: "/api/products/user",
  GET_BY_ID: (id: string) => `/api/products/${id}`,
  UPDATE: (id: string) => `/api/products/${id}`,
  DELETE: (id: string) => `/api/products/${id}`,
  PURCHASE_REQUEST: (id: string) => `/api/products/${id}/purchase-request`,
  PURCHASE: (id: string) => `/api/products/${id}/purchase`,
  ACCEPT_PURCHASE: (id: string) =>
    `/api/products/${id}/accept-purchase-request`,
  CANCEL_PURCHASE: (id: string) =>
    `/api/products/${id}/cancel-purchase-request`,
};

describe("Product API Endpoints", () => {
  let authToken: string;
  let userId: string;
  let testImagePath: string;

  beforeAll(async () => {
    // Create test image if it doesn't exist
    testImagePath = path.join(__dirname, "../../test-files/test-image.jpg");
    const testFilesDir = path.join(__dirname, "../../test-files");

    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }

    if (!fs.existsSync(testImagePath)) {
      const buffer = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
      ]);
      fs.writeFileSync(testImagePath, buffer);
    }
  });

  beforeEach(async () => {
    const { user, token } = await createTestUser({
      email: `seller${Date.now()}@test.com`,
      username: `seller${Date.now()}`,
      password: "password123",
      firstName: "Test",
      lastName: "Seller",
    });
    userId = user._id.toString();
    authToken = token;
  });

  afterEach(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe("POST /api/products (Create)", () => {
    const validProduct = {
      title: "Test Product",
      price: 100,
      category: "electronics",
      condition: "brandNew",
      description: "Test description",
    };

    it("should create a new product", async () => {
      expect(fs.existsSync(testImagePath)).toBe(true);

      const response = await request(app)
        .post(PRODUCT_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .field("title", validProduct.title)
        .field("price", validProduct.price)
        .field("category", validProduct.category)
        .field("condition", validProduct.condition)
        .field("description", validProduct.description)
        .attach("images", testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toHaveProperty(
        "title",
        validProduct.title
      );
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post(PRODUCT_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .field("title", "")
        .field("price", -1);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate category and condition enums", async () => {
      const response = await request(app)
        .post(PRODUCT_ROUTES.CREATE)
        .set(generateAuthHeader(authToken))
        .field("title", validProduct.title)
        .field("price", validProduct.price)
        .field("category", "invalid-category")
        .field("condition", "invalid-condition");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/products", () => {
    beforeEach(async () => {
      await Product.create([
        {
          title: "Product 1",
          price: 100,
          category: "electronics",
          condition: "brandNew",
          seller: userId,
          images: ["test1.jpg"],
        },
        {
          title: "Product 2",
          price: 200,
          category: "furniture",
          condition: "used",
          seller: userId,
          images: ["test2.jpg"],
        },
      ]);
    });

    it("should get products with pagination", async () => {
      const response = await request(app)
        .get(PRODUCT_ROUTES.GET_ALL)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBe(2);
    });

    it("should filter products", async () => {
      const response = await request(app).get(PRODUCT_ROUTES.GET_ALL).query({
        category: "electronics",
        minPrice: 50,
        maxPrice: 150,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].category).toBe("electronics");
    });

    it("should sort products", async () => {
      const response = await request(app).get(PRODUCT_ROUTES.GET_ALL).query({
        sort: "price",
        order: "desc",
      });

      expect(response.status).toBe(200);
      expect(response.body.data.products[0].price).toBe(200);
    });
  });

  describe("GET /api/products/user", () => {
    let testProduct: any;

    beforeEach(async () => {
      testProduct = await Product.create({
        title: "User's Product",
        price: 100,
        category: "electronics",
        condition: "brandNew",
        seller: userId,
        images: ["test.jpg"],
      });
    });

    it("should get authenticated user's products", async () => {
      const response = await request(app)
        .get(PRODUCT_ROUTES.GET_USER_PRODUCTS)
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].seller._id).toBe(userId);
    });
  });

  describe("Product Purchase Flow", () => {
    let testProduct: any;
    let buyerToken: string;
    let buyerId: string;

    beforeEach(async () => {
      // Create test product
      testProduct = await Product.create({
        title: "Product for Sale",
        price: 100,
        category: "electronics",
        condition: "brandNew",
        seller: userId,
        images: ["test.jpg"],
      });

      // Create buyer
      const { user: buyer, token } = await createTestUser({
        email: `buyer${Date.now()}@test.com`,
        username: `buyer${Date.now()}`,
      });
      buyerId = buyer._id.toString();
      buyerToken = token;
    });

    it("should create a purchase request", async () => {
      const response = await request(app)
        .post(PRODUCT_ROUTES.PURCHASE_REQUEST(testProduct._id))
        .set(generateAuthHeader(buyerToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.purchaseRequest).toBeTruthy();
    });

    it("should allow buyer to cancel their purchase request", async () => {
      // First create a purchase request
      await request(app)
        .post(PRODUCT_ROUTES.PURCHASE_REQUEST(testProduct._id))
        .set(generateAuthHeader(buyerToken));

      // Buyer cancels their request
      const response = await request(app)
        .post(PRODUCT_ROUTES.CANCEL_PURCHASE(testProduct._id))
        .set(generateAuthHeader(buyerToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct?.purchaseRequest).toBeNull(); // Changed from toBeUndefined()
    });

    it("should allow seller to cancel a purchase request", async () => {
      // First create a purchase request
      await request(app)
        .post(PRODUCT_ROUTES.PURCHASE_REQUEST(testProduct._id))
        .set(generateAuthHeader(buyerToken));

      // Seller cancels the request
      const response = await request(app)
        .post(PRODUCT_ROUTES.CANCEL_PURCHASE(testProduct._id))
        .set(generateAuthHeader(authToken)); // Using seller's token

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct?.purchaseRequest).toBeNull(); // Changed from toBeUndefined()
    });

    it("should accept a purchase request", async () => {
      // First create a purchase request
      await request(app)
        .post(PRODUCT_ROUTES.PURCHASE_REQUEST(testProduct._id))
        .set(generateAuthHeader(buyerToken));

      // Then accept it
      const response = await request(app)
        .post(PRODUCT_ROUTES.ACCEPT_PURCHASE(testProduct._id))
        .set(generateAuthHeader(authToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct?.sold?.to.toString()).toBe(buyerId);
    });
  });
});
