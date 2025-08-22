import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import userEvent from "@testing-library/user-event";
import { OfficeSelector, useSelectedOffice } from "../../src/components/OfficeSelector";
import { OfficeProvider } from "../../src/contexts/OfficeContext";

const TestComponent = () => {
  const [selectedOffice, setSelectedOffice] = useSelectedOffice();
  return (
    <div>
      <span data-testid="selected-office">{selectedOffice}</span>
      <button onClick={() => setSelectedOffice("SFO")}>Select SFO</button>
      <OfficeSelector />
    </div>
  );
};

describe("OfficeSelector", () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};
    vi.mocked(window.localStorage.getItem).mockImplementation(
      (key: string) => mockLocalStorage[key] || null
    );
    vi.mocked(window.localStorage.setItem).mockImplementation(
      (key: string, value: string) => {
        mockLocalStorage[key] = value;
      }
    );
  });

  describe("Default state", () => {
    it("displays Vienna (VIE) as default office", () => {
      render(<OfficeSelector />);
      
      expect(screen.getByText("🇦🇹")).toBeInTheDocument();
      expect(screen.getByText("Vienna")).toBeInTheDocument();
      expect(screen.getByText("VIE")).toBeInTheDocument();
    });

    it("shows office code on small screens", () => {
      render(<OfficeSelector />);
      
      const codeElement = screen.getByText("VIE");
      expect(codeElement).toHaveClass("sm:hidden");
    });

    it("shows full office name on larger screens", () => {
      render(<OfficeSelector />);
      
      const nameElement = screen.getByText("Vienna");
      expect(nameElement).toHaveClass("hidden", "sm:inline");
    });
  });

  describe("Dropdown functionality", () => {
    it("shows all office options when opened", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      // Click the dropdown button
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      // Check all offices are listed
      expect(screen.getAllByText("🇦🇹")).toHaveLength(2); // One in button, one in dropdown
      expect(screen.getByText("San Francisco")).toBeInTheDocument();
      expect(screen.getByText("Toronto")).toBeInTheDocument();
      expect(screen.getByText("Amsterdam")).toBeInTheDocument();
      expect(screen.getByText("Seattle")).toBeInTheDocument();
      
      // Check office codes in dropdown
      expect(screen.getAllByText("SFO")).toHaveLength(1);
      expect(screen.getAllByText("YYZ")).toHaveLength(1);
      expect(screen.getAllByText("AMS")).toHaveLength(1);
      expect(screen.getAllByText("SEA")).toHaveLength(1);
    });

    it("marks current office as active", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      // Find the Vienna option button (not the main dropdown button)
      const viennaOption = screen.getByRole("button", { name: /Vienna/i });
      expect(viennaOption).toHaveClass("active");
    });

    it("changes office selection when option is clicked", async () => {
      const user = userEvent.setup();
      
      render(
        <OfficeProvider>
          <TestComponent />
        </OfficeProvider>
      );
      
      expect(screen.getByTestId("selected-office")).toHaveTextContent("VIE");
      
      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      // Click San Francisco option
      const sfOption = screen.getByRole("button", { name: /San Francisco/i });
      await user.click(sfOption);
      
      await waitFor(() => {
        expect(screen.getByTestId("selected-office")).toHaveTextContent("SFO");
      });
    });

    it("updates displayed office info after selection", async () => {
      const user = userEvent.setup();
      
      render(
        <OfficeProvider>
          <OfficeSelector />
        </OfficeProvider>
      );
      
      // Open dropdown and select Toronto
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      const torontoOption = screen.getByRole("button", { name: /Toronto/i });
      await user.click(torontoOption);
      
      await waitFor(() => {
        expect(screen.getByText("🇨🇦")).toBeInTheDocument();
        expect(screen.getByText("Toronto")).toBeInTheDocument();
        expect(screen.getByText("YYZ")).toBeInTheDocument();
      });
    });
  });

  describe("Office data", () => {
    const expectedOffices = [
      { code: "VIE", name: "Vienna", flag: "🇦🇹" },
      { code: "SFO", name: "San Francisco", flag: "🇺🇸" },
      { code: "YYZ", name: "Toronto", flag: "🇨🇦" },
      { code: "AMS", name: "Amsterdam", flag: "🇳🇱" },
      { code: "SEA", name: "Seattle", flag: "🇺🇸" },
    ];

    it("displays correct flag for each office", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      expectedOffices.forEach((office) => {
        expect(screen.getByText(office.flag)).toBeInTheDocument();
      });
    });

    it("displays correct names and codes for each office", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      expectedOffices.forEach((office) => {
        expect(screen.getByText(office.name)).toBeInTheDocument();
        expect(screen.getByText(office.code)).toBeInTheDocument();
      });
    });
  });

  describe("useSelectedOffice hook", () => {
    it("provides current office and setter function", () => {
      render(
        <OfficeProvider>
          <TestComponent />
        </OfficeProvider>
      );
      
      expect(screen.getByTestId("selected-office")).toHaveTextContent("VIE");
      
      const button = screen.getByText("Select SFO");
      expect(button).toBeInTheDocument();
    });

    it("allows changing office through hook", async () => {
      const user = userEvent.setup();
      
      render(
        <OfficeProvider>
          <TestComponent />
        </OfficeProvider>
      );
      
      expect(screen.getByTestId("selected-office")).toHaveTextContent("VIE");
      
      const button = screen.getByText("Select SFO");
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId("selected-office")).toHaveTextContent("SFO");
      });
    });

    it("syncs with OfficeSelector component", async () => {
      const user = userEvent.setup();
      
      render(
        <OfficeProvider>
          <TestComponent />
        </OfficeProvider>
      );
      
      // Change through hook
      const hookButton = screen.getByText("Select SFO");
      await user.click(hookButton);
      
      await waitFor(() => {
        // Should update the selector display
        expect(screen.getByText("🇺🇸")).toBeInTheDocument();
        expect(screen.getByText("San Francisco")).toBeInTheDocument();
        expect(screen.getByText("SFO")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper button roles and attributes", () => {
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      expect(dropdownButton).toHaveAttribute("tabIndex", "0");
      expect(dropdownButton).toHaveClass("btn", "btn-ghost", "btn-sm", "gap-2");
    });

    it("has proper dropdown structure", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      const menu = screen.getByRole("menu", { hidden: true });
      expect(menu).toHaveClass("dropdown-content", "menu");
      
      const menuItems = screen.getAllByRole("button");
      // Should have main dropdown button + office option buttons
      expect(menuItems.length).toBeGreaterThan(1);
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      
      // Should be focusable
      await user.tab();
      expect(dropdownButton).toHaveFocus();
      
      // Should open on Enter
      await user.keyboard("{Enter}");
      expect(screen.getByText("San Francisco")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has correct CSS classes for dropdown", () => {
      render(<OfficeSelector />);
      
      const dropdown = screen.getByRole("button").parentElement;
      expect(dropdown).toHaveClass("dropdown", "dropdown-end");
    });

    it("has correct CSS classes for menu", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      const menu = screen.getByRole("menu", { hidden: true });
      expect(menu).toHaveClass(
        "dropdown-content",
        "menu",
        "bg-base-100",
        "rounded-box",
        "z-[1]",
        "w-52",
        "p-2",
        "shadow-xl",
        "border",
        "border-base-300"
      );
    });

    it("displays office info with correct layout classes", async () => {
      const user = userEvent.setup();
      render(<OfficeSelector />);
      
      const dropdownButton = screen.getByRole("button");
      await user.click(dropdownButton);
      
      const officeInfo = screen.getByText("Vienna").parentElement;
      expect(officeInfo).toHaveClass("flex", "flex-col", "items-start");
    });
  });
});
