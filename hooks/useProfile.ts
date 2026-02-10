import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export const useProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState({ name: "User", email: "" });
  const [assetCount, setAssetCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const savedUser = await AsyncStorage.getItem("registeredUser");
      const userData = savedUser
        ? JSON.parse(savedUser)
        : { name: "Guest", email: "guest@example.com" };
      setUser(userData);

      const savedBio = await AsyncStorage.getItem("biometrics_enabled");
      setIsVerified(savedBio === "true");

      const storageKey = `portfolio_${userData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
      const savedAssets = await AsyncStorage.getItem(storageKey);
      if (savedAssets) {
        const assets = JSON.parse(savedAssets);
        setAssetCount(assets.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Sign Out",
      "Are you sure you want to exit your secure vault?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken"); // مسح جلسة الدخول
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/login"); // العودة لشاشة الدخول
          },
        },
      ],
    );
  };

  return { user, assetCount, isVerified, loading, fetchData, handleLogout };
};
