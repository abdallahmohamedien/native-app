import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function ProfileScreen() {
  const { theme, isDarkMode, toggleTheme, currency } = useTheme();
  const router = useRouter();

  const [user, setUser] = useState({ name: "User", email: "" });
  const [assetCount, setAssetCount] = useState(0);
  const [loading, setLoading] = useState(true);


  const WHITE = "#FFFFFF";
  const BLACK = "#000000";
  const LIGHT_GRAY = "#D1D1D1";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const savedUser = await AsyncStorage.getItem("registeredUser");
      const userData = savedUser ? JSON.parse(savedUser) : { name: "Guest", email: "guest@example.com" };
      setUser(userData);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          router.replace("/login");
        },
      },
    ]);
  };

  const onShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: 'Download CryptoPulse and track your assets like a pro! 🚀',
      });
    } catch (e) {
      console.log(e);
    }
  };

  const MenuOption = ({ icon, title, value, onPress, isLast = false }: any) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: theme.cardColor, borderBottomWidth: isLast ? 0 : 0.5, borderBottomColor: isDarkMode ? '#222' : '#eee' }
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? "#1A1A1A" : "#f9f9f9" }]}>
        <Ionicons name={icon} size={20} color={isDarkMode ? WHITE : "#444"} />
      </View>

      <Text style={[styles.menuText, { color: isDarkMode ? WHITE : BLACK }]}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {value && <Text style={[styles.menuValue, { color: isDarkMode ? LIGHT_GRAY : "#888" }]}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={isDarkMode ? "#666" : "#bbb"} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarMain}>
              <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={[styles.editIcon, { borderColor: theme.backgroundColor }]}
              onPress={() => router.push("/edit-profile")}
            >
              <Ionicons name="pencil" size={12} color={WHITE} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.nameText, { color: isDarkMode ? WHITE : BLACK }]}>{user.name}</Text>
          <View style={[styles.emailBadge, { backgroundColor: isDarkMode ? "#1A1A1A" : "rgba(128,128,128,0.1)" }]}>
            <Text style={[styles.emailText, { color: isDarkMode ? LIGHT_GRAY : "#888" }]}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: theme.cardColor }]}>
            <Ionicons name="layers-outline" size={20} color={isDarkMode ? WHITE : "#007AFF"} />
            <Text style={[styles.statVal, { color: isDarkMode ? WHITE : BLACK }]}>{assetCount.toLocaleString('en-US')}</Text>
            <Text style={[styles.statLab, { color: isDarkMode ? LIGHT_GRAY : "#888" }]}>Assets</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.cardColor }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={isDarkMode ? WHITE : "#2ecc71"} />
            <Text style={[styles.statVal, { color: isDarkMode ? WHITE : BLACK }]}>Verified</Text>
            <Text style={[styles.statLab, { color: isDarkMode ? LIGHT_GRAY : "#888" }]}>Status</Text>
          </View>
        </View>

        <View style={styles.menuGroup}>
          <Text style={[styles.groupTitle, { color: isDarkMode ? LIGHT_GRAY : "#888" }]}>Account Settings</Text>
          <View style={[styles.groupCard, { backgroundColor: theme.cardColor }]}>
            <MenuOption icon="person-outline" title="Personal Information" onPress={() => router.push("/edit-profile")} />
            <MenuOption
              icon={isDarkMode ? "moon" : "sunny-outline"}
              title="Appearance"
              value={isDarkMode ? "Dark" : "Light"}
              onPress={toggleTheme}
            />
            <MenuOption icon="card-outline" title="Default Currency" value={currency.label} onPress={() => { }} />
            <MenuOption icon="notifications-outline" title="Price Alerts" onPress={() => router.push("/alerts")} isLast={true} />
          </View>
        </View>

        <View style={styles.menuGroup}>
          <Text style={[styles.groupTitle, { color: isDarkMode ? LIGHT_GRAY : "#888" }]}>More</Text>
          <View style={[styles.groupCard, { backgroundColor: theme.cardColor }]}>
            <MenuOption icon="share-social-outline" title="Invite Friends" onPress={onShare} />
            <MenuOption icon="star-outline" title="Rate us" onPress={() => { }} />
            <MenuOption icon="help-buoy-outline" title="Support Center" onPress={() => { }} isLast={true} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff4757" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: isDarkMode ? "#666" : "#bbb" }]}>CryptoPulse v1.0.2 • Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { alignItems: 'center', paddingTop: 40, marginBottom: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarMain: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#007AFF", shadowOpacity: 0.3, shadowRadius: 15, elevation: 10
  },
  avatarText: { fontSize: 42, color: '#fff', fontWeight: '900' },
  editIcon: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#222',
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center',
    alignItems: 'center', borderWidth: 3
  },
  nameText: { fontSize: 24, fontWeight: '800' },
  emailBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  emailText: { fontSize: 13, fontWeight: '600' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  statItem: { width: '48%', padding: 20, borderRadius: 25, alignItems: 'center', elevation: 2 },
  statVal: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  statLab: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  menuGroup: { paddingHorizontal: 20, marginBottom: 25 },
  groupTitle: { fontSize: 13, fontWeight: '800', marginLeft: 15, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  groupCard: { borderRadius: 25, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '600' },
  menuValue: { marginRight: 8, fontSize: 13, fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, padding: 20 },
  logoutBtnText: { color: '#ff4757', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  footerText: { textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 20 }
});