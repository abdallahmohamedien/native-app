import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export function useAuthStatus() {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("userToken");
      setIsLogged(!!token);
    };
    checkLogin();
  }, [segments]);

  useEffect(() => {
    if (isLogged === null) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const isAuthPage = segments[0] === "login" || segments[0] === "signup";

    if (!isLogged && inTabsGroup) {
      router.replace("/login");
    } else if (isLogged && isAuthPage) {
      router.replace("/(tabs)");
    }
  }, [isLogged, segments, router]);

  return { isLogged };
}
