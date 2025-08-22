import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClerkClient } from "@clerk/backend";
import { requireAuth, getAuth } from "../../auth/clerk";
import { createMockContext, mockClerkUser } from "../setup";

vi.mock("@clerk/backend");

describe("Auth middleware", () => {
  let mockClerk: any;
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockNext = vi.fn();
    mockContext = createMockContext();

    mockClerk = {
      authenticateRequest: vi.fn(),
      users: {
        getUser: vi.fn(),
      },
    };

    vi.mocked(createClerkClient).mockReturnValue(mockClerk);
  });

  describe("getAuth", () => {
    it("should return auth claims when available", () => {
      const authClaims = { userId: "user_123", sessionId: "session_123" };
      mockContext.get.mockReturnValue(authClaims);

      const result = getAuth(mockContext);

      expect(result).toEqual(authClaims);
      expect(mockContext.get).toHaveBeenCalledWith("auth");
    });

    it("should return null when no auth claims available", () => {
      mockContext.get.mockReturnValue(null);

      const result = getAuth(mockContext);

      expect(result).toBeNull();
    });
  });

  describe("requireAuth middleware", () => {
    it("should throw error when Clerk keys are missing", async () => {
      mockContext.env.CLERK_SECRET_KEY = null;

      await expect(requireAuth(mockContext, mockNext)).rejects.toThrow(
        "Missing Clerk keys"
      );
    });

    it("should return 401 when authentication fails", async () => {
      mockClerk.authenticateRequest.mockResolvedValue({
        toAuth: () => null,
      });
      mockContext.json.mockReturnValue({ error: "Unauthorized" });

      await requireAuth(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Unauthorized" },
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when auth has no userId", async () => {
      mockClerk.authenticateRequest.mockResolvedValue({
        toAuth: () => ({ sessionId: "session_123" }),
      });
      mockContext.json.mockReturnValue({ error: "Unauthorized" });

      await requireAuth(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Unauthorized" },
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 when user email is not @sentry.io", async () => {
      const nonSentryUser = {
        ...mockClerkUser,
        primaryEmailAddress: { emailAddress: "test@example.com" },
      };

      mockClerk.authenticateRequest.mockResolvedValue({
        toAuth: () => ({ userId: "user_123", sessionId: "session_123" }),
      });
      mockClerk.users.getUser.mockResolvedValue(nonSentryUser);
      mockContext.json.mockReturnValue({
        error: "Access restricted to @sentry.io email addresses",
      });

      await requireAuth(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Access restricted to @sentry.io email addresses" },
        403
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 when user has no email", async () => {
      const userWithoutEmail = {
        ...mockClerkUser,
        primaryEmailAddress: null,
      };

      mockClerk.authenticateRequest.mockResolvedValue({
        toAuth: () => ({ userId: "user_123", sessionId: "session_123" }),
      });
      mockClerk.users.getUser.mockResolvedValue(userWithoutEmail);
      mockContext.json.mockReturnValue({
        error: "Access restricted to @sentry.io email addresses",
      });

      await requireAuth(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Access restricted to @sentry.io email addresses" },
        403
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should successfully authenticate valid sentry.io user", async () => {
      mockClerk.authenticateRequest.mockResolvedValue({
        toAuth: () => ({ userId: "user_123", sessionId: "session_123" }),
      });
      mockClerk.users.getUser.mockResolvedValue(mockClerkUser);

      await requireAuth(mockContext, mockNext);

      expect(mockClerk.authenticateRequest).toHaveBeenCalledWith(
        mockContext.req.raw
      );
      expect(mockClerk.users.getUser).toHaveBeenCalledWith("user_123");
      expect(mockContext.set).toHaveBeenCalledWith("user", mockClerkUser);
      expect(mockContext.set).toHaveBeenCalledWith("auth", {
        userId: "user_123",
        sessionId: "session_123",
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.json).not.toHaveBeenCalled();
    });

    it("should handle authentication errors gracefully", async () => {
      mockClerk.authenticateRequest.mockRejectedValue(
        new Error("Clerk API error")
      );

      await expect(requireAuth(mockContext, mockNext)).rejects.toThrow(
        "Clerk API error"
      );
    });
  });
});
