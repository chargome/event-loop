import React from "react";

export function DarkModeToggle() {
  const [theme, setTheme] = React.useState<string>(
    () => localStorage.getItem("theme") || "light"
  );

  React.useEffect(() => {
    // Initialize from system preference if not set
    if (!localStorage.getItem("theme") && typeof window !== "undefined") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.dataset.theme = initial;
      return;
    }
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="join">
      <button
        type="button"
        className={`btn btn-sm join-item ${
          theme === "light" ? "btn-primary" : ""
        }`}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
      >
        Light
      </button>
      <button
        type="button"
        className={`btn btn-sm join-item ${
          theme === "dark" ? "btn-primary" : ""
        }`}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
      >
        Dark
      </button>
    </div>
  );
}
