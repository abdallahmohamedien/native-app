import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const usePriceAlertManager = (item: any) => {
  const [targetPrice, setTargetPrice] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") console.log("Notification permissions denied");
    })();
  }, []);

  const saveAlert = async (onSuccess: () => void) => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Invalid price");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const alertKey = `alerts_${userSuffix}`;

      const savedAlerts = await AsyncStorage.getItem(alertKey);
      let alerts = savedAlerts ? JSON.parse(savedAlerts) : [];

      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        coinId: item.id,
        name: item.name,
        targetPrice: price,
        currentAtCreation: Number(item.current_price),
        type: price > Number(item.current_price) ? "UP" : "DOWN",
        active: true,
        createdAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem(alertKey, JSON.stringify(alerts));
      setTargetPrice("");
      onSuccess();
    } catch (error) {
      Alert.alert("Error", "Failed to set alert");
    }
  };

  return { targetPrice, setTargetPrice, saveAlert };
};
