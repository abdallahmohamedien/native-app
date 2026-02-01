import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currency, setCurrency] = useState({
    label: "USD",
    symbol: "$",
    rate: 1,
  });

  const theme = {
    backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
    textColor: isDarkMode ? "#FFFFFF" : "#000000",
    cardColor: isDarkMode ? "#1E1E1E" : "#F8F9FA",
    isDarkMode,
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const changeCurrency = async (label) => {
    if (label === "USD") {
      setCurrency({ label: "USD", symbol: "$", rate: 1 });
      return;
    }

    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/USD`,
      );
      const rate = response.data.rates[label];

      const symbols = { EUR: "€", EGP: "EGP ", SAR: "SR " };
      setCurrency({
        label,
        symbol: symbols[label] || "",
        rate: rate || 1,
      });
    } catch (error) {
      console.error("Currency Update Failed:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, currency, changeCurrency }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
