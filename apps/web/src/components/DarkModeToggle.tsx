import React from "react";

export function DarkModeToggle() {
  const [theme, setTheme] = React.useState<string>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="join">
      <button
        type="button"
        className={`btn btn-sm join-item ${
          theme === "light" ? "btn-primary" : "btn-ghost"
        }`}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
      >
        Light
      </button>
      <button
        type="button"
        className={`btn btn-sm join-item ${
          theme === "dark" ? "btn-primary" : "btn-ghost"
        }`}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
      >
        Dark
      </button>
    </div>
  );
}
