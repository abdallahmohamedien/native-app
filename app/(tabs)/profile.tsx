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

  // States
  const [user, setUser] = useState({ name: "User", email: "" });
  const [assetCount, setAssetCount] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات بشكل شامل
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. جلب بيانات المستخدم
      const savedUser = await AsyncStorage.getItem("registeredUser");
      const userData = savedUser ? JSON.parse(savedUser) : { name: "Guest", email: "guest@example.com" };
      setUser(userData);

      // 2. جلب إحصائيات المحفظة
      const storageKey = `portfolio_${userData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
      const savedAssets = await AsyncStorage.getItem(storageKey);

      if (savedAssets) {
        const assets = JSON.parse(savedAssets);
        setAssetCount(assets.length);
        // ملاحظة: حساب القيمة الإجمالية يحتاج API، هنا نضع قيمة تقديرية أو نتركها 0
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
    } catch (e) { console.log(e); }
  };

  // مكون الخيار (Row) المطور
  const MenuOption = ({ icon, title, value, onPress, color = theme.textColor, isLast = false }: any) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: theme.cardColor, borderBottomWidth: isLast ? 0 : 0.5, borderBottomColor: isDarkMode ? '#333' : '#eee' }
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f9f9f9" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.menuText, { color: theme.textColor }]}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color="#bbb" />
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

        {/* Header - Profile Section */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarMain}>
              <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => router.push("/edit-profile")}
            >
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.nameText, { color: theme.textColor }]}>{user.name}</Text>
          <View style={styles.emailBadge}>
            <Text style={styles.emailText}>{user.email}</Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: theme.cardColor }]}>
            <Ionicons name="layers-outline" size={20} color="#007AFF" />
            <Text style={[styles.statVal, { color: theme.textColor }]}>{assetCount.toLocaleString('en-US')}</Text>
            <Text style={styles.statLab}>Assets</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.cardColor }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#2ecc71" />
            <Text style={[styles.statVal, { color: theme.textColor }]}>Verified</Text>
            <Text style={styles.statLab}>Status</Text>
          </View>
        </View>

        {/* Account Settings Group */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupTitle}>Account Settings</Text>
          <View style={[styles.groupCard, { backgroundColor: theme.cardColor }]}>
            <MenuOption icon="person-outline" title="Personal Information" onPress={() => router.push("/edit-profile")} />
            <MenuOption
              icon={isDarkMode ? "moon" : "sunny-outline"}
              title="Appearance"
              value={isDarkMode ? "Dark" : "Light"}
              onPress={toggleTheme}
            />
            <MenuOption icon="card-outline" title="Default Currency" value={currency.label} onPress={() => { }} />
            <MenuOption icon="notifications-outline" title="Notifications" onPress={() => router.push("/notifications")} isLast={true} />
          </View>
        </View>

        {/* More Group */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupTitle}>More</Text>
          <View style={[styles.groupCard, { backgroundColor: theme.cardColor }]}>
            <MenuOption icon="share-social-outline" title="Invite Friends" onPress={onShare} />
            <MenuOption icon="star-outline" title="Rate us" onPress={() => { }} />
            <MenuOption icon="help-buoy-outline" title="Support Center" onPress={() => { }} isLast={true} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff4757" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>CryptoPulse v1.0.2 • Made with ❤️</Text>
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
    alignItems: 'center', borderWidth: 3, borderColor: '#fff'
  },
  nameText: { fontSize: 24, fontWeight: '800' },
  emailBadge: { backgroundColor: 'rgba(128,128,128,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  emailText: { color: '#888', fontSize: 13, fontWeight: '600' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  statItem: { width: '48%', padding: 20, borderRadius: 25, alignItems: 'center', elevation: 2 },
  statVal: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  statLab: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  menuGroup: { paddingHorizontal: 20, marginBottom: 25 },
  groupTitle: { fontSize: 13, fontWeight: '800', color: '#888', marginLeft: 15, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  groupCard: { borderRadius: 25, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '600' },
  menuValue: { marginRight: 8, color: '#888', fontSize: 13, fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, padding: 20 },
  logoutBtnText: { color: '#ff4757', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  footerText: { textAlign: 'center', color: '#bbb', fontSize: 11, marginTop: 10, marginBottom: 20 }
});