import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test-utils";
import { UiButton } from "../../src/components/UiButton";

describe("UiButton", () => {
  describe("Button variant", () => {
    it("renders as button by default", () => {
      render(<UiButton>Click me</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
    });

    it("applies primary variant classes by default", () => {
      render(<UiButton>Primary</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary", "btn-sm");
    });

    it("applies secondary variant classes", () => {
      render(<UiButton variant="secondary">Secondary</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-secondary", "btn-sm");
    });

    it("applies ghost variant classes", () => {
      render(<UiButton variant="ghost">Ghost</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-ghost", "btn-sm");
    });

    it("applies size classes correctly", () => {
      render(<UiButton size="lg">Large</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary", "btn-lg");
    });

    it("applies medium size by default (no extra class)", () => {
      render(<UiButton size="md">Medium</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary");
      expect(button).not.toHaveClass("btn-sm", "btn-lg");
    });

    it("applies loading state", () => {
      render(<UiButton loading>Loading</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary", "btn-sm", "loading");
    });

    it("applies custom className", () => {
      render(<UiButton className="custom-class">Custom</UiButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary", "btn-sm", "custom-class");
    });

    it("handles click events", () => {
      const handleClick = vi.fn();
      render(<UiButton onClick={handleClick}>Click</UiButton>);
      
      const button = screen.getByRole("button");
      button.click();
      
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it("passes through button attributes", () => {
      render(
        <UiButton type="submit" disabled aria-label="Submit form">
          Submit
        </UiButton>
      );
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-label", "Submit form");
    });
  });

  describe("Anchor variant", () => {
    it("renders as anchor when href is provided", () => {
      render(<UiButton href="/test">Link</UiButton>);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent("Link");
      expect(link).toHaveAttribute("href", "/test");
    });

    it("applies correct classes to anchor", () => {
      render(
        <UiButton href="/test" variant="secondary" size="lg">
          Link
        </UiButton>
      );
      const link = screen.getByRole("link");
      expect(link).toHaveClass("btn", "btn-secondary", "btn-lg");
    });

    it("passes through anchor attributes", () => {
      render(
        <UiButton href="/test" target="_blank" rel="noopener">
          External Link
        </UiButton>
      );
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener");
    });

    it("applies loading state to anchor", () => {
      render(
        <UiButton href="/test" loading>
          Loading Link
        </UiButton>
      );
      const link = screen.getByRole("link");
      expect(link).toHaveClass("btn", "btn-primary", "btn-sm", "loading");
    });
  });

  describe("Class composition", () => {
    it("combines all classes correctly", () => {
      render(
        <UiButton 
          variant="ghost" 
          size="lg" 
          loading 
          className="extra-class"
        >
          Complex
        </UiButton>
      );
      
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "btn",
        "btn-ghost", 
        "btn-lg", 
        "loading", 
        "extra-class"
      );
    });

    it("filters out falsy class values", () => {
      render(<UiButton>Simple</UiButton>);
      const button = screen.getByRole("button");
      
      // Should not have empty classes or undefined/null classes
      const classList = Array.from(button.classList);
      expect(classList.every(cls => cls.trim().length > 0)).toBe(true);
    });
  });

  describe("TypeScript types", () => {
    it("accepts React.ReactNode as children", () => {
      render(
        <UiButton>
          <span>Complex</span> children
        </UiButton>
      );
      
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Complex children");
    });
  });
});
