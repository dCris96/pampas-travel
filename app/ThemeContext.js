import { createContext, useState, useContext, useEffect } from "react";

// Create Theme Context
const ThemeContext = createContext();
const ColorContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    } else {
      return "light";
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);

      const handleSystemThemeChange = (e) => {
        const systemTheme = e.matches ? "dark" : "light";
        setTheme(systemTheme);
        document.documentElement.setAttribute("data-theme", systemTheme);
      };

      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkModeQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        darkModeQuery.removeEventListener("change", handleSystemThemeChange);
      };
    }
  }, []);

  const setLightTheme = () => {
    setTheme("light");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  const setDarkTheme = () => {
    setTheme("dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  };

  const setSystemTheme = () => {
    if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme("system");
      localStorage.setItem("theme", systemTheme);
      document.documentElement.setAttribute("data-theme", systemTheme);
    }
  };

  // Color state
  const [color, setColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("acent-color") || "#4058f2";
    } else {
      return "#4058f2";
    }
  });

  const changeColor = (newColor) => {
    setColor(newColor);
    if (typeof window !== "undefined") {
      localStorage.setItem("acent-color", newColor);
      document.documentElement.style.setProperty("--acent-color", newColor);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setLightTheme, setDarkTheme, setSystemTheme }}
    >
      <ColorContext.Provider value={{ color, changeColor }}>
        {children}
      </ColorContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useColor = () => useContext(ColorContext);
