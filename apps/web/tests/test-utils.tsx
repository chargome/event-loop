import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { OfficeProvider } from "../src/contexts/OfficeContext";

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <OfficeProvider>{children}</OfficeProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Helper to create mock events
export const createMockEvent = (overrides = {}) => ({
  id: 1,
  title: "Test Event",
  description: "Test Description",
  location: "Test Location",
  office: "VIE" as const,
  startsAt: new Date("2024-01-01T10:00:00Z"),
  capacity: 50,
  signupMode: "internal" as const,
  isPublic: true,
  status: "active" as const,
  createdBy: 1,
  createdAt: new Date("2024-01-01T09:00:00Z"),
  isRegistered: false,
  attendees: [],
  goingCount: 0,
  ...overrides,
});

// Helper to mock localStorage with initial values
export const mockLocalStorageWithValues = (values: Record<string, string>) => {
  const localStorage = window.localStorage;
  Object.entries(values).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

// Helper to wait for next tick
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));
