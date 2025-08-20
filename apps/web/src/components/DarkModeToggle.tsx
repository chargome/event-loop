import React from "react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") return false;

    // Check for saved preference first
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") return true;
    if (saved === "false") return false;

    // If no saved preference, use OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    const theme = isDark ? "dark" : "light";

    // Apply theme to both data-theme attribute and class
    root.setAttribute("data-theme", theme);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save preference to localStorage
    localStorage.setItem("darkMode", isDark.toString());
    localStorage.setItem("theme", theme); // Keep for backward compatibility

    // Debug logging
    console.log("🌙 Dark mode applied:", {
      isDark,
      theme,
      dataTheme: root.getAttribute("data-theme"),
      hasClass: root.classList.contains("dark"),
      osPreference: window.matchMedia("(prefers-color-scheme: dark)").matches,
      localStorage: localStorage.getItem("darkMode"),
    });
  }, [isDark]);

  // Listen for OS theme changes when no preference is saved
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't set a manual preference
      const hasSavedPreference = localStorage.getItem("darkMode");
      if (!hasSavedPreference) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-circle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun Icon - Light Mode */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`absolute w-5 h-5 transform transition-all duration-300 ease-in-out ${
            !isDark
              ? "translate-y-0 rotate-0 opacity-100"
              : "-translate-y-8 rotate-180 opacity-0"
          }`}
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>

        {/* Moon Icon - Dark Mode */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`absolute w-5 h-5 transform transition-all duration-300 ease-in-out ${
            isDark
              ? "translate-y-0 rotate-0 opacity-100"
              : "translate-y-8 -rotate-180 opacity-0"
          }`}
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
  );
}
