/* cspell:ignore Haptics */
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile } from "../hooks/useProfile";
import { useTheme } from "../src/context/ThemeContext";

export default function SettingsScreen() {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { handleLogout } = useProfile();

  const SettingItem = ({ icon, title, onPress, value, color = theme.textColor, isLast = false }: any) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: theme.cardColor, borderBottomWidth: isLast ? 0 : 0.5, borderBottomColor: isDarkMode ? '#222' : '#eee' }
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1A1A1A' : '#f9f9f9' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.itemText, { color: color }]}>{title}</Text>
      </View>
      {value !== undefined ? (
        <Ionicons
          name={isDarkMode && title === "Dark Mode" ? "toggle" : "toggle-outline"}
          size={32}
          color={isDarkMode && title === "Dark Mode" ? "#007AFF" : "#ccc"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#888" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#888' : '#666' }]}>Preferences</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={isDarkMode ? "moon" : "sunny"}
            title="Dark Mode"
            onPress={toggleTheme}
            value={isDarkMode}
          />
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            onPress={() => { }}
            isLast={true}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#888' : '#666' }]}>Security & Support</Text>
        <View style={styles.groupCard}>
          <SettingItem icon="shield-half-outline" title="Privacy Policy" onPress={() => { }} />
          <SettingItem icon="help-circle-outline" title="Help Center" onPress={() => { }} isLast={true} />
        </View>


        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.cardColor }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff4757" />
          <Text style={styles.logoutText}>Sign Out of Vault</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>CryptoPulse v1.0.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 10, marginLeft: 10, textTransform: "uppercase", letterSpacing: 1 },
  groupCard: { borderRadius: 22, overflow: 'hidden', marginBottom: 25 },
  item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemText: { fontSize: 16, fontWeight: "600", marginLeft: 15 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: 18, borderRadius: 22, marginTop: 10, borderWidth: 1, borderColor: "rgba(255, 71, 87, 0.1)"
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#ff4757", marginLeft: 10 },
  versionText: { textAlign: 'center', color: '#555', fontSize: 11, marginTop: 30, fontWeight: '600' }
});