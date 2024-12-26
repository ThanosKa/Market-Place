// tests/integration/auth.test.ts

import request from "supertest";
import app from "../../src/server";
import User from "../../src/models/User";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/tokenUtils";

describe("Auth API Endpoints", () => {
  const testUser = {
    email: "test@example.com",
    username: "testuser",
    password: "Password123!",
    confirmPassword: "Password123!",
    firstName: "Test",
    lastName: "User",
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(1);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toMatchObject({
        email: testUser.email.toLowerCase(),
        username: testUser.username,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      });
    });

    it("should not register user with invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...testUser,
          email: "invalid-email",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("Invalid email");
    });

    it("should not register user with mismatched passwords", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...testUser,
          confirmPassword: "DifferentPassword123!",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("Passwords do not match");
    });

    it("should not register duplicate email/username", async () => {
      // Register first user
      await request(app).post("/api/auth/register").send(testUser);

      // Try to register same user again
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login successfully with email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        login: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it("should login successfully with username", async () => {
      const response = await request(app).post("/api/auth/login").send({
        login: testUser.username,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.access_token).toBeDefined();
    });

    it("should not login with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        login: testUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should not login with non-existent user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        login: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
    });
  });

  describe("POST /api/auth/exchange-token", () => {
    let authorizationCode: string;

    beforeEach(async () => {
      // Register and get authorization code
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      authorizationCode = response.body.data.token;
    });

    it("should exchange authorization code for tokens", async () => {
      const response = await request(app)
        .post("/api/auth/exchange-token")
        .send({ code: authorizationCode });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
      expect(response.body.data.token_type).toBe("Bearer");
      expect(response.body.data.expires_in).toBeDefined();
    });

    it("should not exchange invalid authorization code", async () => {
      const response = await request(app)
        .post("/api/auth/exchange-token")
        .send({ code: "invalid-code" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    let refreshToken: string;

    beforeEach(async () => {
      // First register the user
      await request(app).post("/api/auth/register").send({
        email: testUser.email,
        username: testUser.username,
        password: testUser.password,
        confirmPassword: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      });

      // Then login to get refresh token
      const loginResponse = await request(app).post("/api/auth/login").send({
        login: testUser.email,
        password: testUser.password,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data).toBeDefined();
      refreshToken = loginResponse.body.data.refresh_token;
    });

    it("should refresh access token successfully", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refresh_token: refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.access_token).toBeDefined();

      // Verify the new access token is valid
      const decoded = verifyAccessToken(response.body.data.access_token);
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBeDefined();
    });

    it("should not refresh with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refresh_token: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(0);
    });

    it("should not refresh without refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
    });
  });
});
