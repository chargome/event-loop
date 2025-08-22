import { vi } from "vitest";

// Global test setup
vi.mock("@clerk/backend", () => ({
  createClerkClient: vi.fn(),
}));

// Mock D1Database interface
export const mockD1Database = {
  prepare: vi.fn(),
  dump: vi.fn(),
  batch: vi.fn(),
  exec: vi.fn(),
};

// Mock Hono context
export const createMockContext = (overrides?: any) => {
  return {
    env: {
      DB: mockD1Database,
      CLERK_SECRET_KEY: "test-secret-key",
      CLERK_PUBLISHABLE_KEY: "test-publishable-key",
      ...overrides?.env,
    },
    req: {
      param: vi.fn(),
      query: vi.fn(),
      json: vi.fn(),
      raw: new Request("http://localhost"),
      ...overrides?.req,
    },
    json: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    ...overrides,
  };
};

// Mock Clerk user
export const mockClerkUser = {
  id: "user_123",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  primaryEmailAddress: {
    emailAddress: "test@sentry.io",
  },
  imageUrl: "https://example.com/avatar.jpg",
};

// Mock Drizzle query result
export const createMockDrizzleQuery = (result: any) => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue(result),
  };

  // Make the query itself thenable
  Object.assign(mockQuery, {
    then: (
      onResolve?: (value: any) => any,
      onReject?: (reason: any) => any
    ) => {
      return Promise.resolve(result).then(onResolve, onReject);
    },
    catch: (onReject?: (reason: any) => any) => {
      return Promise.resolve(result).catch(onReject);
    },
    finally: (onFinally?: () => void) => {
      return Promise.resolve(result).finally(onFinally);
    },
  });

  return mockQuery;
};
