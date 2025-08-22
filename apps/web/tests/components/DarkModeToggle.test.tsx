import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import userEvent from "@testing-library/user-event";
import { DarkModeToggle } from "../../src/components/DarkModeToggle";

// Create a more complete mock for matchMedia
const createMatchMediaMock = (matches: boolean = false) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];
  
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn((listener) => listeners.push(listener)),
    removeListener: vi.fn((listener) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }),
    addEventListener: vi.fn((event, listener) => {
      if (event === "change") listeners.push(listener);
    }),
    removeEventListener: vi.fn((event, listener) => {
      if (event === "change") {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      }
    }),
    dispatchEvent: vi.fn(),
    // Helper to trigger change events in tests
    _triggerChange: (newMatches: boolean) => {
      const event = { matches: newMatches } as MediaQueryListEvent;
      listeners.forEach(listener => listener(event));
    },
  }));
};

describe("DarkModeToggle", () => {
  let mockMatchMedia: ReturnType<typeof createMatchMediaMock>;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};
    vi.mocked(window.localStorage.getItem).mockImplementation(
      (key: string) => mockLocalStorage[key] || null
    );
    vi.mocked(window.localStorage.setItem).mockImplementation(
      (key: string, value: string) => {
        mockLocalStorage[key] = value;
      }
    );
    
    // Create fresh matchMedia mock
    mockMatchMedia = createMatchMediaMock(false);
    Object.defineProperty(window, "matchMedia", {
      value: mockMatchMedia,
      writable: true,
    });

    // Mock document.documentElement methods
    const mockElement = {
      setAttribute: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      },
      getAttribute: vi.fn(),
    };
    
    Object.defineProperty(document, "documentElement", {
      value: mockElement,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial state", () => {
    it("defaults to light mode when no preference is saved", () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
      expect(button).toHaveAttribute("title", "Switch to dark mode");
    });

    it("respects saved dark mode preference", () => {
      mockLocalStorage.darkMode = "true";
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
      expect(button).toHaveAttribute("title", "Switch to light mode");
    });

    it("respects saved light mode preference", () => {
      mockLocalStorage.darkMode = "false";
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    });

    it("uses OS preference when no saved preference exists", () => {
      // Mock OS dark mode preference
      mockMatchMedia = createMatchMediaMock(true);
      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
        writable: true,
      });
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    });
  });

  describe("Theme application", () => {
    it("applies dark theme to document element", async () => {
      mockLocalStorage.darkMode = "true";
      const mockElement = document.documentElement as any;
      
      render(<DarkModeToggle />);
      
      await waitFor(() => {
        expect(mockElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
        expect(mockElement.classList.add).toHaveBeenCalledWith("dark");
      });
    });

    it("applies light theme to document element", async () => {
      mockLocalStorage.darkMode = "false";
      const mockElement = document.documentElement as any;
      
      render(<DarkModeToggle />);
      
      await waitFor(() => {
        expect(mockElement.setAttribute).toHaveBeenCalledWith("data-theme", "light");
        expect(mockElement.classList.remove).toHaveBeenCalledWith("dark");
      });
    });

    it("saves theme preference to localStorage", async () => {
      render(<DarkModeToggle />);
      
      await waitFor(() => {
        expect(window.localStorage.setItem).toHaveBeenCalledWith("darkMode", "false");
        expect(window.localStorage.setItem).toHaveBeenCalledWith("theme", "light");
      });
    });
  });

  describe("Toggle functionality", () => {
    it("toggles from light to dark mode", async () => {
      const user = userEvent.setup();
      mockLocalStorage.darkMode = "false";
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
      
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Switch to light mode");
        expect(mockLocalStorage.darkMode).toBe("true");
      });
    });

    it("toggles from dark to light mode", async () => {
      const user = userEvent.setup();
      mockLocalStorage.darkMode = "true";
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
      
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
        expect(mockLocalStorage.darkMode).toBe("false");
      });
    });

    it("updates document classes on toggle", async () => {
      const user = userEvent.setup();
      const mockElement = document.documentElement as any;
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      await waitFor(() => {
        expect(mockElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
        expect(mockElement.classList.add).toHaveBeenCalledWith("dark");
      });
    });
  });

  describe("Icon animations", () => {
    it("shows sun icon in light mode", () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      const sunIcon = button.querySelector('svg:first-of-type');
      const moonIcon = button.querySelector('svg:last-of-type');
      
      expect(sunIcon).toHaveClass("translate-y-0", "rotate-0", "opacity-100");
      expect(moonIcon).toHaveClass("translate-y-8", "-rotate-180", "opacity-0");
    });

    it("shows moon icon in dark mode", () => {
      mockLocalStorage.darkMode = "true";
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      const sunIcon = button.querySelector('svg:first-of-type');
      const moonIcon = button.querySelector('svg:last-of-type');
      
      expect(sunIcon).toHaveClass("-translate-y-8", "rotate-180", "opacity-0");
      expect(moonIcon).toHaveClass("translate-y-0", "rotate-0", "opacity-100");
    });
  });

  describe("OS theme change listener", () => {
    it("registers media query change listener", () => {
      render(<DarkModeToggle />);
      
      expect(mockMatchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
      const mediaQueryList = mockMatchMedia.mock.results[0].value;
      expect(mediaQueryList.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("responds to OS theme changes when no saved preference", async () => {
      // No saved preference
      const mockElement = document.documentElement as any;
      
      render(<DarkModeToggle />);
      
      // Simulate OS switching to dark mode
      const mediaQueryList = mockMatchMedia.mock.results[0].value;
      mediaQueryList._triggerChange(true);
      
      await waitFor(() => {
        expect(mockElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
      });
    });

    it("ignores OS theme changes when user has saved preference", async () => {
      mockLocalStorage.darkMode = "false"; // User prefers light
      const mockElement = document.documentElement as any;
      
      render(<DarkModeToggle />);
      
      // Clear previous calls
      mockElement.setAttribute.mockClear();
      
      // Simulate OS switching to dark mode
      const mediaQueryList = mockMatchMedia.mock.results[0].value;
      mediaQueryList._triggerChange(true);
      
      await waitFor(() => {
        // Should not change because user has explicit preference
        expect(mockElement.setAttribute).not.toHaveBeenCalledWith("data-theme", "dark");
      });
    });

    it("cleans up event listener on unmount", () => {
      const { unmount } = render(<DarkModeToggle />);
      
      const mediaQueryList = mockMatchMedia.mock.results[0].value;
      expect(mediaQueryList.addEventListener).toHaveBeenCalled();
      
      unmount();
      
      expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });
  });

  describe("Accessibility", () => {
    it("has proper button attributes", () => {
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveClass("btn", "btn-ghost", "btn-sm", "btn-circle");
    });

    it("updates aria-label based on current mode", async () => {
      const user = userEvent.setup();
      
      render(<DarkModeToggle />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
      expect(button).toHaveAttribute("title", "Switch to dark mode");
      
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Switch to light mode");
        expect(button).toHaveAttribute("title", "Switch to light mode");
      });
    });
  });
});
