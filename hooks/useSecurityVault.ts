import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";

export const useSecurityVault = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [biometricsActive, setBiometricsActive] = useState(false);

  const loadVaultData = useCallback(async () => {
    try {
      const [savedData, savedBio] = await Promise.all([
        AsyncStorage.getItem("registeredUser"),
        AsyncStorage.getItem("biometrics_enabled"),
      ]);

      if (savedData) {
        const user = JSON.parse(savedData);
        setName(user.name || "");
        setEmail(user.email || "");
        setPassword(user.password || "");
      }
      setBiometricsActive(savedBio === "true");
    } catch (error) {
      console.error("Vault Initialization Error:", error);
    }
  }, []);

  useEffect(() => {
    loadVaultData();
  }, [loadVaultData]);

  const toggleBiometrics = async (value: boolean) => {
    try {
      if (value) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Accessing Secure Core",
          disableDeviceFallback: true,
        });

        if (result.success) {
          setBiometricsActive(true);
          await AsyncStorage.setItem("biometrics_enabled", "true");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showMessage({
            message: "Quantum Shield Enabled 🛡️",
            type: "success",
          });
        } else {
          setBiometricsActive(false);
        }
      } else {
        setBiometricsActive(false);
        await AsyncStorage.setItem("biometrics_enabled", "false");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      setBiometricsActive(false);
    }
  };

  const syncWithVault = async (onSuccess: () => void) => {
    setLoading(true);
    try {
      const updatedUser = { name, email, password };
      await AsyncStorage.setItem("registeredUser", JSON.stringify(updatedUser));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1000);
    } catch (e) {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    biometricsActive,
    toggleBiometrics,
    loading,
    syncWithVault,
  };
};
