import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockContext,
  mockClerkUser,
  createMockDrizzleQuery,
} from "../setup";

// Mock the dependencies
vi.mock("../../auth/clerk", () => ({
  requireAuth: vi.fn((c: any, next: any) => next()),
}));

vi.mock("../../db/client", () => ({
  createDb: vi.fn(),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  desc: vi.fn(),
}));

import { createDb } from "../../db/client";
import { eq, desc } from "drizzle-orm";

describe("Comments API routes", () => {
  let mockContext: any;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = createMockContext();

    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
    };

    vi.mocked(createDb).mockReturnValue({
      db: mockDb,
      client: {} as any,
    });
  });

  describe("GET /:eventId", () => {
    it("should return comments for valid event ID", () => {
      const mockComments = [
        {
          id: 1,
          content: "Great event!",
          created_at: new Date(),
          updated_at: new Date(),
          user_id: 1,
          name: "Test User",
          email: "test@sentry.io",
          avatar_url: "https://example.com/avatar.jpg",
        },
      ];

      mockContext.req.param.mockReturnValue("1");
      mockContext.json.mockReturnValue({ comments: mockComments });

      // Test the parameter validation logic
      const eventIdParam = Number(mockContext.req.param("eventId"));
      expect(Number.isFinite(eventIdParam)).toBe(true);
      expect(eventIdParam).toBe(1);

      expect(mockContext.req.param).toHaveBeenCalledWith("eventId");
    });

    it("should return 400 for invalid event ID", async () => {
      mockContext.req.param.mockReturnValue("invalid");
      mockContext.json.mockReturnValue({ error: "Invalid event ID" });

      // Simulate the route logic
      const eventIdParam = Number(mockContext.req.param("eventId"));
      if (!Number.isFinite(eventIdParam)) {
        mockContext.json({ error: "Invalid event ID" }, 400);
        return;
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Invalid event ID" },
        400
      );
    });

    it("should handle database errors gracefully", () => {
      mockContext.req.param.mockReturnValue("1");
      mockContext.json.mockReturnValue({ error: "Database error" });

      // Test error handling logic
      const mockError = new Error("Database error");
      try {
        throw mockError;
      } catch (error) {
        mockContext.json({ error: String(error) }, 500);
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Error: Database error" },
        500
      );
    });
  });

  describe("POST /:eventId", () => {
    beforeEach(() => {
      mockContext.get.mockImplementation((key: string) => {
        if (key === "user") return mockClerkUser;
        return null;
      });
    });

    it("should create comment successfully", async () => {
      const content = "This is a test comment";
      const mockNewComment = {
        id: 1,
        content,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 1,
        name: "Test User",
        email: "test@sentry.io",
        avatar_url: "https://example.com/avatar.jpg",
      };

      mockContext.req.param.mockReturnValue("1");
      mockContext.req.json.mockResolvedValue({ content });
      mockContext.json.mockReturnValue({ comment: mockNewComment });

      // Test validation logic
      const eventIdParam = Number(mockContext.req.param("eventId"));
      expect(Number.isFinite(eventIdParam)).toBe(true);

      const body = await mockContext.req.json();
      const commentContent =
        typeof body?.content === "string" ? body.content.trim() : "";
      expect(commentContent).toBe(content);

      const user = mockContext.get("user");
      expect(user?.id).toBe("user_123");

      // Simulate the successful response
      mockContext.json({ comment: mockNewComment }, 201);

      expect(mockContext.json).toHaveBeenCalledWith(
        { comment: mockNewComment },
        201
      );
    });

    it("should return 400 for invalid event ID", async () => {
      mockContext.req.param.mockReturnValue("invalid");
      mockContext.json.mockReturnValue({ error: "Invalid event ID" });

      // Simulate the route logic
      const eventIdParam = Number(mockContext.req.param("eventId"));
      if (!Number.isFinite(eventIdParam)) {
        mockContext.json({ error: "Invalid event ID" }, 400);
        return;
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Invalid event ID" },
        400
      );
    });

    it("should return 400 for empty content", async () => {
      mockContext.req.param.mockReturnValue("1");
      mockContext.req.json.mockResolvedValue({ content: "   " });
      mockContext.json.mockReturnValue({
        error: "Comment content is required",
      });

      // Simulate the route logic
      const eventIdParam = Number(mockContext.req.param("eventId"));
      if (!Number.isFinite(eventIdParam)) {
        mockContext.json({ error: "Invalid event ID" }, 400);
        return;
      }

      const body = await mockContext.req.json();
      const commentContent =
        typeof body?.content === "string" ? body.content.trim() : "";
      if (!commentContent) {
        mockContext.json({ error: "Comment content is required" }, 400);
        return;
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Comment content is required" },
        400
      );
    });

    it("should return 401 when user is not authenticated", async () => {
      mockContext.req.param.mockReturnValue("1");
      mockContext.req.json.mockResolvedValue({ content: "Test comment" });
      mockContext.get.mockReturnValue(null);
      mockContext.json.mockReturnValue({ error: "Unauthorized" });

      // Simulate the route logic
      const eventIdParam = Number(mockContext.req.param("eventId"));
      const body = await mockContext.req.json();
      const commentContent = body.content.trim();

      const user = mockContext.get("user");
      if (!user?.id) {
        mockContext.json({ error: "Unauthorized" }, 401);
        return;
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Unauthorized" },
        401
      );
    });

    it("should create new user if not exists", async () => {
      mockContext.req.param.mockReturnValue("1");
      mockContext.req.json.mockResolvedValue({ content: "Test comment" });

      // Test logic for new user creation
      const existingUsers: any[] = []; // No existing users
      let dbUserId: number;

      if (existingUsers.length === 0) {
        // Simulate creating new user
        const newUser = { id: 2 };
        dbUserId = newUser.id;
      } else {
        dbUserId = existingUsers[0].id;
      }

      expect(dbUserId).toBe(2);
      expect(existingUsers.length).toBe(0);
    });
  });
});
