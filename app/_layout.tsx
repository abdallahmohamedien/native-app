import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import FlashMessage from "react-native-flash-message";
import { ThemeProvider } from "../src/context/ThemeContext";

export default function RootLayout() {
  const { isLogged } = useAuthStatus();

  if (isLogged === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="edit-profile" />
        </Stack>
        <FlashMessage position="top" floating={true} />
      </View>
    </ThemeProvider>
  );
}