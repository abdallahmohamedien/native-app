import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://api.coingecko.com/api/v3";
const CACHE_KEY = "CACHED_COINS";
const CACHE_TIME = 5 * 60 * 1000;

export const getCoinsData = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_TIME;

      if (!isExpired) {
        console.log("Reading from Cache ⚡");
        return data;
      }
    }

    console.log("Fetching from API 🌐");
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
      },
    });

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: response.data,
      }),
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn("Rate limit hit! Serving old cache.");
      const lastKnownData = await AsyncStorage.getItem(CACHE_KEY);
      if (lastKnownData) {
        return JSON.parse(lastKnownData).data;
      }
    }

    console.error("API Error:", error.message);
    return [];
  }
};
