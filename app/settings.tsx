import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../src/context/ThemeContext";

export default function SettingsScreen() {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. مسح التوكن من الذاكرة
            await AsyncStorage.removeItem("userToken");
            // 2. التوجه فوراً لشاشة اللوجين واستبدال المسار الحالي
            router.replace("/login");
          } catch (e) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* خيار تبديل الثيم */}
      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme.cardColor }]}
        onPress={toggleTheme}
      >
        <View style={styles.itemLeft}>
          <Ionicons
            name={isDarkMode ? "moon" : "sunny"}
            size={22}
            color={theme.textColor}
          />
          <Text style={[styles.itemText, { color: theme.textColor }]}>
            Dark Mode
          </Text>
        </View>
        <Ionicons
          name={isDarkMode ? "toggle" : "toggle-outline"}
          size={30}
          color={isDarkMode ? "#007AFF" : "#ccc"}
        />
      </TouchableOpacity>

      {/* زر تسجيل الخروج */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: theme.cardColor }]}
        onPress={handleLogout}
      >
        <View style={styles.itemLeft}>
          <Ionicons name="log-out-outline" size={22} color="#ff4757" />
          <Text style={[styles.itemText, { color: "#ff4757" }]}>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 71, 87, 0.2)",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
  },
});
