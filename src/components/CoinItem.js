import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const CoinItem = ({ item }) => {
  const { theme, currency } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  // --- دالة لجلب مفتاح المفضلة الخاص بالمستخدم الحالي ---
  const getFavoritesKey = async () => {
    const userData = await AsyncStorage.getItem("registeredUser");
    if (userData) {
      const { email } = JSON.parse(userData);
      return `favorites_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
    }
    return "favorites_guest";
  };

  // فحص حالة النجمة عند تحميل المكون
  useEffect(() => {
    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    const key = await getFavoritesKey();
    const saved = await AsyncStorage.getItem(key);
    const favoriteIds = saved ? JSON.parse(saved) : [];
    setIsFavorite(favoriteIds.includes(item.id));
  };

  const toggleFavorite = async () => {
    const key = await getFavoritesKey();
    const saved = await AsyncStorage.getItem(key);
    let favoriteIds = saved ? JSON.parse(saved) : [];

    if (favoriteIds.includes(item.id)) {
      favoriteIds = favoriteIds.filter((id) => id !== item.id);
      setIsFavorite(false);
    } else {
      favoriteIds.push(item.id);
      setIsFavorite(true);
    }

    await AsyncStorage.setItem(key, JSON.stringify(favoriteIds));
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.label,
    minimumFractionDigits: 2,
  }).format(item.current_price * currency.rate);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundColor,
          borderBottomColor: theme.isDarkMode ? "#333" : "#f1f1f1",
        },
      ]}
    >
      <View style={styles.left}>
        {/* زر النجمة للمفضلة */}
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteIcon}>
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={20}
            color={isFavorite ? "#FFD700" : "#888"}
          />
        </TouchableOpacity>

        <Image source={{ uri: item.image }} style={styles.image} />
        <View>
          <Text style={[styles.name, { color: theme.textColor }]}>
            {item.name}
          </Text>
          <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.price, { color: theme.textColor }]}>
          {formattedPrice}
        </Text>
        <Text
          style={[
            styles.change,
            {
              color:
                item.price_change_percentage_24h > 0 ? "#2ecc71" : "#e74c3c",
            },
          ]}
        >
          {item.price_change_percentage_24h > 0 ? "+" : ""}
          {item.price_change_percentage_24h?.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  left: { flexDirection: "row", alignItems: "center" },
  favoriteIcon: { marginRight: 10, padding: 5 }, // مساحة للضغط على النجمة
  image: { width: 32, height: 32, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "bold" },
  symbol: { fontSize: 12, color: "#888", marginTop: 2 },
  right: { alignItems: "flex-end" },
  price: { fontSize: 16, fontWeight: "bold" },
  change: { fontSize: 13, marginTop: 4, fontWeight: "500" },
});

export default React.memo(CoinItem);
