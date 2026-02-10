import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useState } from "react";
import { Alert } from "react-native";

export const useAssetActions = (item: any) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const triggerNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  };

  const addToPortfolio = async (onSuccess: () => void) => {
    const buyAmount = Number(amount);
    if (!amount || isNaN(buyAmount) || buyAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

      // 1. تحديث الـ Portfolio
      const storageKey = `portfolio_${userSuffix}`;
      const savedPortfolio = await AsyncStorage.getItem(storageKey);
      let portfolio = savedPortfolio ? JSON.parse(savedPortfolio) : [];
      const existingIndex = portfolio.findIndex((p: any) => p.id === item.id);

      if (existingIndex > -1) {
        portfolio[existingIndex].amount += buyAmount;
      } else {
        portfolio.push({
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          image: item.image,
          amount: buyAmount,
          entryPrice: Number(item.current_price),
        });
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(portfolio));

      // 2. تسجيل العملية في الـ History
      const historyKey = `history_${userSuffix}`;
      const savedHistory = await AsyncStorage.getItem(historyKey);
      let history = savedHistory ? JSON.parse(savedHistory) : [];
      history.unshift({
        id: Math.random().toString(36).substr(2, 9),
        coinId: item.id,
        name: item.name,
        symbol: item.symbol,
        type: "buy",
        amount: buyAmount,
        price: Number(item.current_price),
        date: new Date().toISOString(),
      });
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));

      await triggerNotification(
        "Trade Executed! ✅",
        `You successfully added ${amount} ${item.name}.`,
      );
      setAmount("");
      onSuccess();
    } catch (error) {
      Alert.alert("Error", "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return { amount, setAmount, addToPortfolio, loading };
};
