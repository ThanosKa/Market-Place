import request from "supertest";
import app from "../../src/server";
import User from "../../src/models/User";
import { createTestUser } from "../helpers/testHelpers";

describe("Reset Password API Endpoint", () => {
  let testUser: any;

  beforeEach(async () => {
    // Create a test user
    const { user } = await createTestUser({
      email: `test${Date.now()}@test.com`,
      username: "mastermaster",
      password: "oldpassword",
      firstName: "Test",
      lastName: "User",
    });
    testUser = user;
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/reset-password-by-username", () => {
    it("should successfully reset password with valid master key", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-by-username")
        .send({
          username: "mastermaster",
          password: "password",
          masterKey: "master",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.message).toContain("Password updated successfully");

      // Verify the user can login with the new password
      const user = await User.findById(testUser._id);
      const isPasswordValid = await user!.comparePassword("password");
      expect(isPasswordValid).toBe(true);
    });

    it("should reject request with invalid master key", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-by-username")
        .send({
          username: "mastermaster",
          password: "password",
          masterKey: "wrongkey",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should reject request without master key", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-by-username")
        .send({
          username: "mastermaster",
          password: "password",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should return error for non-existent username", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-by-username")
        .send({
          username: "nonexistentuser",
          password: "password",
          masterKey: "master",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("User not found");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-by-username")
        .send({
          username: "mastermaster",
          masterKey: "master",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("required");
    });

    it("should validate password length", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password-by-username")
        .send({
          username: "mastermaster",
          password: "12345", // too short
          masterKey: "master",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(0);
      expect(response.body.message).toContain("at least 6 characters");
    });
  });
});
