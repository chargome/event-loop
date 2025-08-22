import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key: string) => null),
  setItem: vi.fn((key: string, value: string) => {}),
  removeItem: vi.fn((key: string) => {}),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Clerk
vi.mock("@clerk/clerk-react", () => ({
  useAuth: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: "user_123",
    getToken: vi.fn().mockResolvedValue("mock-token"),
  })),
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  SignInButton: () => <button>Sign In</button>,
  UserButton: () => <button>User Menu</button>,
  UserProfile: () => <div>User Profile</div>,
  useUser: vi.fn(() => ({
    isLoaded: true,
    user: {
      id: "user_123",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@sentry.io" }],
    },
  })),
}));

// Mock TanStack Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((options: any) => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...options.defaultData,
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: null,
    isLoading: false,
    error: null,
    reset: vi.fn(),
  })),
  QueryClient: vi.fn(() => ({
    clear: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn(() => ({})),
  useLocation: vi.fn(() => ({ pathname: "/" })),
  useRouter: vi.fn(() => ({
    navigate: vi.fn(),
  })),
}));

// Clean up mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
