import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  // دالة داخلية للحصول على المفتاح الخاص بكل مستخدم
  const getAlertKey = async () => {
    const userData = await AsyncStorage.getItem("registeredUser");
    const email = userData ? JSON.parse(userData).email : "guest";
    const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    return `alerts_${userSuffix}`;
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const alertKey = await getAlertKey();
      const savedAlerts = await AsyncStorage.getItem(alertKey);
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, []);

  const removeAlert = async (id: string) => {
    try {
      const updatedAlerts = alerts.filter((a) => a.id !== id);
      setAlerts(updatedAlerts);
      const alertKey = await getAlertKey();
      await AsyncStorage.setItem(alertKey, JSON.stringify(updatedAlerts));
      return true;
    } catch (error) {
      console.error("Delete alert failed:", error);
      return false;
    }
  };

  return { alerts, fetchAlerts, removeAlert };
};
