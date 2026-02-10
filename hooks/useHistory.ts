import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

export type TransactionType = "all" | "buy" | "sell";

export const useHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<TransactionType>("all");

  const fetchHistory = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const historyKey = `history_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;

      const savedHistory = await AsyncStorage.getItem(historyKey);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((item) => item.type === filter);
  }, [history, filter]);

  const handleFilterPress = () => {
    Alert.alert("Filter Activity", "Choose transaction type to display:", [
      { text: "All Transactions", onPress: () => setFilter("all") },
      { text: "Only Buys (+)", onPress: () => setFilter("buy") },
      { text: "Only Sells (-)", onPress: () => setFilter("sell") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return { history, filter, filteredHistory, fetchHistory, handleFilterPress };
};
