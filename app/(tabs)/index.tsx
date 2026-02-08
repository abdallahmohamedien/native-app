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
              body: `${alert.name} has hit your target of ${currency.symbol}${alert.targetPrice.toLocaleString()}!`,
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
      }
    } catch (e) {
      console.error("Alert Monitor Error:", e);
    }
  }, [currency.symbol]);

  const getFavoritesKey = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      if (userData) {
        const { email } = JSON.parse(userData);
        return `favorites_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
      }
      return "favorites_guest";
    } catch {
      return "favorites_guest";
    }
  }, []);

  const updateWatchlist = useCallback(async (data = allCoins) => {
    const storageKey = await getFavoritesKey();
    const saved = await AsyncStorage.getItem(storageKey);
    const favoriteIds: string[] = saved ? JSON.parse(saved) : [];
    const favs = data.filter((c) => favoriteIds.includes(c.id));
    setFavoriteCoins(favs);
    setFilteredCoins(data);
  }, [allCoins, getFavoritesKey]);


  const fetchData = useCallback(async () => {
    try {
      const data = await getCoinsData();
      setAllCoins(data);
      updateWatchlist(data);


      checkPriceAlerts(data);

    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateWatchlist, checkPriceAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      updateWatchlist();
    }, [updateWatchlist])
  );

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = allCoins.filter(
      (c) =>
        c.name.toLowerCase().includes(text.toLowerCase()) ||
        c.symbol.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoins(filtered);
  };

  const renderWatchlist = () => {
    if (favoriteCoins.length === 0 || search.length > 0) return null;

    return (
      <View style={styles.watchlistContainer}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Your Watchlist ⭐</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={favoriteCoins}
          keyExtractor={(item) => `fav-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.favCard, { backgroundColor: theme.cardColor }]}
              onPress={() => router.push({ pathname: "/details", params: item as any })}
            >
              <Image source={{ uri: item.image }} style={styles.favImage} />
              <Text style={[styles.favSymbol, { color: theme.textColor }]}>{item.symbol.toUpperCase()}</Text>
              <Text style={[styles.favPrice, { color: item.price_change_percentage_24h >= 0 ? "#2ed573" : "#ff4757" }]}>
                {item.price_change_percentage_24h.toFixed(1)}%
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} />

      <View style={[styles.header, { borderBottomColor: theme.isDarkMode ? "#333" : "#eee" }]}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: theme.textColor }]}>CryptoPulse</Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>

            <TouchableOpacity
              onPress={() => router.push("/alerts")}
              style={[styles.iconBtn, { marginRight: 15 }]}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.textColor} />
              <View style={styles.alertDot} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={theme.isDarkMode ? "sunny" : "moon"} size={24} color={theme.textColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.cardColor }]}>
            <Ionicons name="search" size={18} color="#888" style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.input, { color: theme.textColor }]}
              placeholder="Search market..."
              placeholderTextColor="#888"
              value={search}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.currencyRow}>
          {["USD", "EUR", "EGP", "SAR"].map((curr) => (
            <TouchableOpacity
              key={curr}
              onPress={() => changeCurrency(curr)}
              style={[
                styles.currBtn,
                currency.label === curr && { backgroundColor: "#007AFF", borderColor: "#007AFF" },
              ]}
            >
              <Text style={[styles.currText, { color: currency.label === curr ? "#fff" : theme.textColor }]}>
                {curr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ flex: 1 }} color="#007AFF" />
      ) : (
        <FlatList
          data={filteredCoins}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderWatchlist}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: "/details", params: item as any })}>
              <CoinItem item={item} />
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.textColor }}>No results found.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15, borderBottomWidth: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 26, fontWeight: "900", letterSpacing: -1 },
  iconBtn: { padding: 5, position: 'relative' },
  alertDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    backgroundColor: '#ff4757',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  searchRow: { flexDirection: "row", marginBottom: 12 },
  searchBox: { flex: 1, height: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  input: { flex: 1, fontSize: 16 },
  currencyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  currBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#ccc", minWidth: 60, alignItems: "center" },
  currText: { fontSize: 12, fontWeight: "bold" },
  watchlistContainer: { paddingVertical: 20, paddingLeft: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 15 },
  favCard: {
    width: 110, padding: 15, borderRadius: 20, marginRight: 15, alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  favImage: { width: 35, height: 35, marginBottom: 8 },
  favSymbol: { fontWeight: "800", fontSize: 14 },
  favPrice: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  emptyContainer: { alignItems: "center", marginTop: 50 },
});