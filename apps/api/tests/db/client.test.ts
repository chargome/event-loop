import { describe, it, expect, vi } from "vitest";
import { drizzle } from "drizzle-orm/d1";
import { createDb } from "../../db/client";
import { createMockContext, mockD1Database } from "../setup";

vi.mock("drizzle-orm/d1");

describe("Database client", () => {
  it("should create database instance with D1 client", () => {
    const mockContext = createMockContext();
    const mockDrizzleInstance = { query: vi.fn() };

    vi.mocked(drizzle).mockReturnValue(mockDrizzleInstance as any);

    const result = createDb(mockContext);

    expect(drizzle).toHaveBeenCalledWith(mockD1Database);
    expect(result).toEqual({
      db: mockDrizzleInstance,
      client: mockD1Database,
    });
  });

  it("should return same D1 instance as client", () => {
    const mockContext = createMockContext();
    const customD1Instance = { prepare: vi.fn() };
    mockContext.env.DB = customD1Instance;

    const mockDrizzleInstance = { query: vi.fn() };
    vi.mocked(drizzle).mockReturnValue(mockDrizzleInstance as any);

    const result = createDb(mockContext);

    expect(result.client).toBe(customD1Instance);
    expect(drizzle).toHaveBeenCalledWith(customD1Instance);
  });
});
