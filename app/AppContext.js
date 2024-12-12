import { createContext, useState, useContext, useEffect } from "react";
import { ProfileImageProvider } from "./contextos/ProfileImageContext";
import { DatePickerProvider } from "./contextos/DatePickerContext";

const ThemeContext = createContext();
const ColorContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [color, setColor] = useState("#4058f2");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "light";
      if (savedTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setTheme("system");
        document.documentElement.setAttribute("data-theme", systemTheme);
      } else {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      }

      const handleSystemThemeChange = (e) => {
        if (theme === "system") {
          const systemTheme = e.matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", systemTheme);
        }
      };

      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkModeQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        darkModeQuery.removeEventListener("change", handleSystemThemeChange);
      };
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("acent-color") || "#4058f2";
      setColor(savedColor);
      document.documentElement.style.setProperty("--acent-color", savedColor);
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
    setTheme("system");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", "system");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
    }
  };

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
        <ProfileImageProvider>
          <DatePickerProvider>{children}</DatePickerProvider>
        </ProfileImageProvider>
      </ColorContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useColor = () => useContext(ColorContext);
