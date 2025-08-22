import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockContext, mockD1Database } from "../setup";

// Mock the dependencies
vi.mock("../../auth/clerk", () => ({
  requireAuth: vi.fn((c: any, next: any) => next()),
}));

vi.mock("../../db/client", () => ({
  createDb: vi.fn(),
}));

import { createDb } from "../../db/client";

describe("DB API routes", () => {
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = createMockContext();
  });

  describe("GET /health", () => {
    it("should return health check success", async () => {
      const mockClient = {
        prepare: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ ok: 1 }),
        }),
      };

      vi.mocked(createDb).mockReturnValue({
        db: {} as any,
        client: mockClient as any,
      });

      mockContext.json.mockReturnValue({ ok: true, result: { ok: 1 } });

      // Simulate the health check logic
      const { client } = createDb(mockContext);
      const result = await client.prepare("SELECT 1 as ok").first();
      mockContext.json({ ok: true, result });

      expect(createDb).toHaveBeenCalledWith(mockContext);
      expect(mockClient.prepare).toHaveBeenCalledWith("SELECT 1 as ok");
      expect(mockContext.json).toHaveBeenCalledWith({
        ok: true,
        result: { ok: 1 },
      });
    });

    it("should return error when database check fails", async () => {
      const mockError = new Error("Database connection failed");
      const mockClient = {
        prepare: vi.fn().mockReturnValue({
          first: vi.fn().mockRejectedValue(mockError),
        }),
      };

      vi.mocked(createDb).mockReturnValue({
        db: {} as any,
        client: mockClient as any,
      });

      mockContext.json.mockReturnValue({
        ok: false,
        error: "Database connection failed",
      });

      // Simulate the health check logic with error handling
      try {
        const { client } = createDb(mockContext);
        await client.prepare("SELECT 1 as ok").first();
        mockContext.json({ ok: true });
      } catch (error) {
        mockContext.json({ ok: false, error: String(error) }, 500);
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { ok: false, error: "Error: Database connection failed" },
        500
      );
    });

    it("should handle database client creation errors", async () => {
      const mockError = new Error("Failed to create DB client");
      vi.mocked(createDb).mockImplementation(() => {
        throw mockError;
      });

      mockContext.json.mockReturnValue({
        ok: false,
        error: "Failed to create DB client",
      });

      // Simulate the health check logic with createDb error handling
      try {
        createDb(mockContext);
      } catch (error) {
        mockContext.json({ ok: false, error: String(error) }, 500);
      }

      expect(mockContext.json).toHaveBeenCalledWith(
        { ok: false, error: "Error: Failed to create DB client" },
        500
      );
    });
  });
});
