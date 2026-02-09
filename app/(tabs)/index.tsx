import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getCoinsData } from "../../src/api/coinService";
import CoinItem from "../../src/components/CoinItem";
import { useTheme } from "../../src/context/ThemeContext";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme, toggleTheme, currency, changeCurrency } = useTheme();

  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [favoriteCoins, setFavoriteCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [hasActiveAlerts, setHasActiveAlerts] = useState(false);

  // Monitor price alerts and trigger notifications
  const checkPriceAlerts = useCallback(async (currentMarkets: Coin[]) => {
    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const alertKey = `alerts_${userSuffix}`;

      const savedAlerts = await AsyncStorage.getItem(alertKey);
      if (!savedAlerts) return;

      let alerts = JSON.parse(savedAlerts);
      let hasChanges = false;

      const activeAlerts = alerts.some((a: any) => a.active);
      setHasActiveAlerts(activeAlerts);

      alerts.forEach((alert: any, index: number) => {
        if (!alert.active) return;

        const currentCoin = currentMarkets.find(m => m.id === alert.coinId);
        if (!currentCoin) return;

        const currentPrice = currentCoin.current_price;
        let triggered = false;

        if (alert.type === 'UP' && currentPrice >= alert.targetPrice) triggered = true;
        if (alert.type === 'DOWN' && currentPrice <= alert.targetPrice) triggered = true;

        if (triggered) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: `🚀 Price Alert: ${alert.name}`,
              body: `${alert.name} hit your target ${currency.symbol}${alert.targetPrice.toLocaleString()}`,
              sound: true,
            },
            trigger: null,
          });
          alerts[index].active = false;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        await AsyncStorage.setItem(alertKey, JSON.stringify(alerts));
        setHasActiveAlerts(alerts.some((a: any) => a.active));
      }
    } catch (e) {
      console.error("Alert Monitor Error:", e);
    }
  }, [currency.symbol]);

  // Fetch market data and update states
  const fetchData = useCallback(async () => {
    try {
      const data = await getCoinsData();
      setAllCoins(data);

      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const storageKey = `favorites_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
      const savedFavs = await AsyncStorage.getItem(storageKey);
      const favoriteIds: string[] = savedFavs ? JSON.parse(savedFavs) : [];

      // Fixed TypeScript error by adding (c: Coin)
      setFavoriteCoins(data.filter((c: Coin) => favoriteIds.includes(c.id)));

      // Fixed TypeScript error in search filter
      setFilteredCoins(search
        ? data.filter((c: Coin) => c.name.toLowerCase().includes(search.toLowerCase()))
        : data
      );

      checkPriceAlerts(data);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, checkPriceAlerts]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleSearch = (text: string) => {
    setSearch(text);
    // Added type definition (c: Coin) to fix TS7006
    const filtered = allCoins.filter(
      (c: Coin) => c.name.toLowerCase().includes(text.toLowerCase()) ||
        c.symbol.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoins(filtered);
  };

  const renderWatchlist = () => {
    if (favoriteCoins.length === 0 || search.length > 0) return null;
    return (
      <View style={styles.watchlistContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Watchlist</Text>
          <Ionicons name="star" size={16} color="#f1c40f" />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={favoriteCoins}
          keyExtractor={(item) => `fav-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.favCard, { backgroundColor: theme.cardColor }]}
              onPress={() => router.push({ pathname: "/details", params: item as any })}
            >
              <Image source={{ uri: item.image }} style={styles.favImage} />
              <Text style={[styles.favSymbol, { color: theme.textColor }]}>{item.symbol.toUpperCase()}</Text>
              <View style={[styles.favBadge, { backgroundColor: item.price_change_percentage_24h >= 0 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)' }]}>
                <Text style={[styles.favPercentage, { color: item.price_change_percentage_24h >= 0 ? "#2ecc71" : "#e74c3c" }]}>
                  {item.price_change_percentage_24h >= 0 ? '+' : ''}{item.price_change_percentage_24h.toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} />

      <View style={[styles.header, { borderBottomColor: theme.isDarkMode ? "#222" : "#f0f0f0" }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.brandTitle, { color: theme.textColor }]}>CryptoPulse</Text>
            <Text style={styles.dateSub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/alerts")}
              style={[styles.actionBtn, { backgroundColor: theme.cardColor }]}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.textColor} />
              {hasActiveAlerts && <View style={styles.alertDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.actionBtn, { backgroundColor: theme.cardColor, marginLeft: 10 }]}
            >
              <Ionicons name={theme.isDarkMode ? "sunny-outline" : "moon-outline"} size={22} color={theme.textColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.cardColor }]}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: theme.textColor }]}
            placeholder="Search crypto..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.currencyRow}>
          {["USD", "EUR", "EGP", "SAR"].map((curr) => (
            <TouchableOpacity
              key={curr}
              onPress={() => changeCurrency(curr)}
              style={[
                styles.currTab,
                currency.label === curr && { backgroundColor: "#007AFF" },
              ]}
            >
              <Text style={[styles.currTabText, { color: currency.label === curr ? "#fff" : "#888" }]}>
                {curr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredCoins}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderWatchlist}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: "/details", params: item as any })}
            >
              <CoinItem item={item} />
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#ccc" />
              <Text style={{ color: '#888', marginTop: 10 }}>No coins found</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  brandTitle: { fontSize: 28, fontWeight: "900", letterSpacing: -1.5 },
  dateSub: { color: "#888", fontSize: 12, fontWeight: "600", marginTop: -2 },
  headerActions: { flexDirection: 'row' },
  actionBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  alertDot: {
    position: 'absolute', top: 12, right: 12, width: 8, height: 8,
    backgroundColor: '#ff4757', borderRadius: 4, borderWidth: 1.5, borderColor: '#fff'
  },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, borderRadius: 16, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '500' },
  currencyRow: { flexDirection: "row", gap: 10 },
  currTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: 'transparent' },
  currTabText: { fontSize: 13, fontWeight: "800" },
  watchlistContainer: { paddingTop: 20, paddingBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "900" },
  favCard: {
    width: 120, padding: 16, borderRadius: 24, marginLeft: 20, alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  favImage: { width: 40, height: 40, marginBottom: 10 },
  favSymbol: { fontWeight: "900", fontSize: 15, marginBottom: 6 },
  favBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  favPercentage: { fontSize: 11, fontWeight: "900" },
  loader: { flex: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: "center", marginTop: 80 },
});