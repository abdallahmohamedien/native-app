import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { showMessage } from "react-native-flash-message";
import { useTheme } from "../src/context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme, currency } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [assetAmount, setAssetAmount] = useState("1");

  // تنظيف الـ Params والتأكد من أنها أرقام إنجليزية
  const id = String(params.id);
  const name = String(params.name);
  const image = String(params.image);
  const price_change = Number(params.price_change_percentage_24h) || 0;
  const numericPrice = Number(params.current_price) * currency.rate;

  // دالة لتنسيق الأرقام بالإنجليزية دائماً
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.label,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getUserKey = async (prefix: string) => {
    const userData = await AsyncStorage.getItem("registeredUser");
    if (userData) {
      const { email } = JSON.parse(userData);
      return `${prefix}_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
    }
    return `${prefix}_guest`;
  };

  const checkIfFavorite = useCallback(async () => {
    const key = await getUserKey("favorites");
    const saved = await AsyncStorage.getItem(key);
    const favorites: string[] = saved ? JSON.parse(saved) : [];
    setIsFavorite(favorites.includes(id));
  }, [id]);

  useEffect(() => {
    checkIfFavorite();
  }, [checkIfFavorite]);

  const toggleFavorite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const key = await getUserKey("favorites");
    const saved = await AsyncStorage.getItem(key);
    let favorites: string[] = saved ? JSON.parse(saved) : [];

    if (isFavorite) {
      favorites = favorites.filter((favId) => favId !== id);
      showMessage({ message: "Removed", type: "danger" });
    } else {
      favorites.push(id);
      showMessage({ message: "Added to Favorites", type: "success" });
    }

    await AsyncStorage.setItem(key, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const addToPortfolio = async () => {
    const amountNum = parseFloat(assetAmount);
    if (!amountNum || amountNum <= 0) {
      showMessage({ message: "Invalid Amount", type: "warning" });
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const key = await getUserKey("portfolio");
      const saved = await AsyncStorage.getItem(key);
      let assets = saved ? JSON.parse(saved) : [];
      const existingIndex = assets.findIndex((a: any) => a.id === id);

      if (existingIndex > -1) {
        assets[existingIndex].amount += amountNum;
      } else {
        assets.push({ id, amount: amountNum });
      }

      await AsyncStorage.setItem(key, JSON.stringify(assets));
      showMessage({ message: "Portfolio Updated!", type: "success" });
    } catch (error) {
      showMessage({ message: "Error saving asset", type: "danger" });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: theme.cardColor }]}>
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>{name} Analysis</Text>
        <TouchableOpacity onPress={toggleFavorite} style={[styles.headerBtn, { backgroundColor: theme.cardColor }]}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#e74c3c" : theme.textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Image source={{ uri: image }} style={styles.coinImage} />
            <Text style={[styles.priceText, { color: theme.textColor }]}>{formatCurrency(numericPrice)}</Text>
            <View style={[styles.changeBadge, { backgroundColor: price_change > 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)' }]}>
              <Ionicons name={price_change > 0 ? "caret-up" : "caret-down"} size={16} color={price_change > 0 ? "#2ecc71" : "#e74c3c"} />
              <Text style={[styles.changeText, { color: price_change > 0 ? "#2ecc71" : "#e74c3c" }]}>
                {Math.abs(price_change).toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* Chart Section */}
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: ["1D", "4H", "8H", "12H", "16H", "20H"],
                datasets: [{ data: [numericPrice * 0.95, numericPrice * 1.02, numericPrice * 0.98, numericPrice * 1.05, numericPrice * 1.03, numericPrice] }],
              }}
              width={screenWidth + 60} // لجعل الرسم يملأ الشاشة
              height={220}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              chartConfig={{
                backgroundGradientFrom: theme.backgroundColor,
                backgroundGradientTo: theme.backgroundColor,
                decimalPlaces: 2,
                color: (opacity = 1) => price_change > 0 ? `rgba(46, 204, 113, ${opacity})` : `rgba(231, 76, 60, ${opacity})`,
                labelColor: () => '#888',
                style: { borderRadius: 16 },
                propsForBackgroundLines: { strokeDasharray: "" }
              }}
              bezier
              style={{ marginLeft: -30, paddingRight: 0 }}
            />
          </View>

          {/* Asset Management Card */}
          <View style={[styles.sectionCard, { backgroundColor: theme.cardColor }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Holdings Management</Text>
              <Ionicons name="wallet-outline" size={20} color="#007AFF" />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundColor, color: theme.textColor }]}
                placeholder="0.00"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={assetAmount}
                onChangeText={setAssetAmount}
              />
              <TouchableOpacity style={styles.buyBtn} onPress={addToPortfolio}>
                <Text style={styles.buyBtnText}>Update Assets</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  customHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  headerBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", opacity: 0.8 },
  priceContainer: { alignItems: "center", marginVertical: 20 },
  coinImage: { width: 60, height: 60, marginBottom: 15 },
  priceText: { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  changeText: { fontSize: 16, fontWeight: "bold", marginLeft: 4 },
  chartWrapper: { marginVertical: 20, alignItems: 'center' },
  sectionCard: { marginHorizontal: 20, padding: 20, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  inputRow: { flexDirection: "row", gap: 10 },
  input: { flex: 1, height: 50, borderRadius: 15, paddingHorizontal: 15, fontSize: 18, fontWeight: 'bold' },
  buyBtn: { backgroundColor: "#007AFF", paddingHorizontal: 20, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  buyBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});