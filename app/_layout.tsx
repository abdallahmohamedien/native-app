import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { ThemeProvider } from "../src/context/ThemeContext";
import FlashMessage from "react-native-flash-message";

export default function RootLayout() {
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
    const inAuthGroup = segments[0] === "(tabs)";
    if (!isLogged && inAuthGroup) {
      router.replace("/login");
    } else if (
      isLogged &&
      (segments[0] === "login" || segments[0] === "signup")
    ) {
      router.replace("/(tabs)");
    }
  }, [isLogged, segments]);

  if (isLogged === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {/* 2. تغليف التطبيق بـ View للسماح لـ FlashMessage بالظهور فوق الـ Stack */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {/* 3. وضع المكون هنا ليكون متاحاً لكل الشاشات */}
        <FlashMessage position="top" floating={true} />
      </View>
    </ThemeProvider>
  );
}
