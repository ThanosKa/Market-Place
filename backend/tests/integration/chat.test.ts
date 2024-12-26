// tests/integration/chat.test.ts

import request from "supertest";
import app from "../../src/server";
import { createTestUser, generateAuthHeader } from "../helpers/testHelpers";
import Chat from "../../src/models/Chat";
import path from "path";
import fs from "fs";

describe("Chat API Endpoints", () => {
  let userOneToken: string;
  let userOneId: string;
  let userTwoToken: string;
  let userTwoId: string;
  let testChatId: string;
  let testImagePath: string;

  beforeAll(async () => {
    // Create test image
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
    // Create two test users
    const { user: userOne, token: tokenOne } = await createTestUser({
      email: `user1${Date.now()}@test.com`,
      username: `user1${Date.now()}`,
    });
    const { user: userTwo, token: tokenTwo } = await createTestUser({
      email: `user2${Date.now()}@test.com`,
      username: `user2${Date.now()}`,
    });

    userOneId = userOne._id.toString();
    userTwoId = userTwo._id.toString();
    userOneToken = tokenOne;
    userTwoToken = tokenTwo;

    // Create a test chat between the users
    const chat = await Chat.create({
      participants: [userOneId, userTwoId],
      messages: [],
    });
    testChatId = chat._id.toString();
  });

  afterEach(async () => {
    await Chat.deleteMany({});
  });

  describe("POST /api/chats (Create Chat)", () => {
    it("should create a new chat between users", async () => {
      const response = await request(app)
        .post("/api/chats")
        .set(generateAuthHeader(userOneToken))
        .send({ participantId: userTwoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.chat).toBeDefined();
      expect(response.body.data.chat.participants).toHaveLength(2);
    });

    it("should not create duplicate chats", async () => {
      // Create first chat
      await request(app)
        .post("/api/chats")
        .set(generateAuthHeader(userOneToken))
        .send({ participantId: userTwoId });

      // Try to create duplicate
      const response = await request(app)
        .post("/api/chats")
        .set(generateAuthHeader(userOneToken))
        .send({ participantId: userTwoId });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("already exists");
    });
  });

  describe("GET /api/chats (Get User Chats)", () => {
    it("should get all chats for a user", async () => {
      const response = await request(app)
        .get("/api/chats")
        .set(generateAuthHeader(userOneToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(Array.isArray(response.body.data.chats)).toBe(true);
    });
  });

  describe("POST /api/chats/:chatId/messages (Send Message)", () => {
    it("should send a text message", async () => {
      const response = await request(app)
        .post(`/api/chats/${testChatId}/messages`)
        .set(generateAuthHeader(userOneToken))
        .send({ content: "Test message" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.message.content).toBe("Test message");
    });

    it("should send a message with image", async () => {
      const response = await request(app)
        .post(`/api/chats/${testChatId}/messages`)
        .set(generateAuthHeader(userOneToken))
        .attach("images", testImagePath)
        .field("content", "Test message with image");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.message.images).toBeDefined();
      expect(response.body.data.message.images.length).toBe(1);
    });
  });

  describe("GET /api/chats/:chatId/messages (Get Messages)", () => {
    beforeEach(async () => {
      // Add some test messages
      await Chat.findByIdAndUpdate(testChatId, {
        $push: {
          messages: {
            sender: userOneId,
            content: "Test message 1",
            timestamp: new Date(),
            seen: false,
          },
        },
      });
    });

    it("should get chat messages with pagination", async () => {
      const response = await request(app)
        .get(`/api/chats/${testChatId}/messages`)
        .set(generateAuthHeader(userOneToken))
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });
  });

  describe("PUT /api/chats/:chatId/messages/:messageId (Edit Message)", () => {
    let messageId: string;

    beforeEach(async () => {
      const chat = await Chat.findByIdAndUpdate(
        testChatId,
        {
          $push: {
            messages: {
              sender: userOneId,
              content: "Original message",
              timestamp: new Date(),
              seen: false,
            },
          },
        },
        { new: true }
      );
      messageId = chat!.messages[0]._id.toString();
    });

    it("should edit a message", async () => {
      const response = await request(app)
        .put(`/api/chats/${testChatId}/messages/${messageId}`)
        .set(generateAuthHeader(userOneToken))
        .send({ content: "Edited message" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.message.content).toBe("Edited message");
      expect(response.body.data.message.edited).toBe(true);
    });
  });

  describe("DELETE /api/chats/:chatId/messages/:messageId (Delete Message)", () => {
    let messageId: string;

    beforeEach(async () => {
      const chat = await Chat.findByIdAndUpdate(
        testChatId,
        {
          $push: {
            messages: {
              sender: userOneId,
              content: "Message to delete",
              timestamp: new Date(),
              seen: false,
            },
          },
        },
        { new: true }
      );
      messageId = chat!.messages[0]._id.toString();
    });

    it("should delete a message", async () => {
      const response = await request(app)
        .delete(`/api/chats/${testChatId}/messages/${messageId}`)
        .set(generateAuthHeader(userOneToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const chat = await Chat.findById(testChatId);
      expect(chat!.messages.length).toBe(0);
    });
  });

  describe("POST /api/chats/:chatId/seen (Mark Messages as Seen)", () => {
    beforeEach(async () => {
      await Chat.findByIdAndUpdate(testChatId, {
        $push: {
          messages: {
            sender: userTwoId,
            content: "Unseen message",
            timestamp: new Date(),
            seen: false,
          },
        },
      });
    });

    it("should mark messages as seen", async () => {
      const response = await request(app)
        .post(`/api/chats/${testChatId}/seen`)
        .set(generateAuthHeader(userOneToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);

      const chat = await Chat.findById(testChatId);
      expect(chat!.messages[0].seen).toBe(true);
    });
  });

  describe("GET /api/chats/unread-count", () => {
    beforeEach(async () => {
      await Chat.findByIdAndUpdate(testChatId, {
        $push: {
          messages: {
            sender: userTwoId,
            content: "Unread message",
            timestamp: new Date(),
            seen: false,
          },
        },
      });
    });

    it("should get unread chats count", async () => {
      const response = await request(app)
        .get("/api/chats/unread-count")
        .set(generateAuthHeader(userOneToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(1);
      expect(response.body.data.unreadChatsCount).toBe(1);
    });
  });
});
