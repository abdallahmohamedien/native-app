import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTheme } from "../../src/context/ThemeContext";

const { width } = Dimensions.get("window");
const CHART_COLORS = ["#007AFF", "#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6", "#34495e"];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const toEn = (num: string | number) => {
  if (num === undefined || num === null) return "—";
  return num.toString().replace(/[٠-٩]/g, (d) =>
    "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()
  );
};

export default function PortfolioScreen() {
  const { theme, currency } = useTheme();
  const router = useRouter();

  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPL, setTotalPL] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [sellAmount, setSellAmount] = useState("");

  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const key = `portfolio_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;

      const savedPortfolio = await AsyncStorage.getItem(key);
      if (!savedPortfolio || JSON.parse(savedPortfolio).length === 0) {
        setPortfolioData([]);
        setTotalValue(0);
        setTotalPL(0);
        return;
      }

      const localAssets = JSON.parse(savedPortfolio);
      const ids = localAssets.map((a: any) => a.id).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
      );
      const marketData = await response.json();

      if (!Array.isArray(marketData)) return;

      let currentTotal = 0;
      let currentPL = 0;

      const mergedData = localAssets.map((local: any) => {
        const market = marketData.find((m: any) => m.id === local.id);
        if (market) {
          const currentVal = market.current_price * local.amount * currency.rate;
          const entryVal = (local.entryPrice || market.current_price) * local.amount * currency.rate;
          currentTotal += currentVal;
          currentPL += currentVal - entryVal;
          return { ...local, ...market, currentVal, pl: currentVal - entryVal };
        }
        return local;
      });

      setPortfolioData(mergedData);
      setTotalValue(currentTotal);
      setTotalPL(currentPL);
    } catch (error) {
      console.error("Fetch Portfolio Error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [currency.rate]);

  useFocusEffect(useCallback(() => { fetchPortfolio(); }, [fetchPortfolio]));

  const handleSell = async () => {
    const amountToSell = parseFloat(toEn(sellAmount));
    if (isNaN(amountToSell) || amountToSell <= 0 || amountToSell > selectedCoin.amount) {
      Alert.alert("Error", "Invalid amount or insufficient balance");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const key = `portfolio_${userSuffix}`;
      const historyKey = `history_${userSuffix}`;

      const savedData = await AsyncStorage.getItem(key);
      let localAssets = JSON.parse(savedData || "[]");

      let updatedAssets = localAssets
        .map((asset: any) => {
          if (asset.id === selectedCoin.id)
            return { ...asset, amount: asset.amount - amountToSell };
          return asset;
        })
        .filter((asset: any) => asset.amount > 0.000001);

      await AsyncStorage.setItem(key, JSON.stringify(updatedAssets));

      const savedHistory = await AsyncStorage.getItem(historyKey);
      let history = savedHistory ? JSON.parse(savedHistory) : [];
      history.unshift({
        id: Math.random().toString(36).substr(2, 9),
        coinId: selectedCoin.id,
        name: selectedCoin.name,
        symbol: selectedCoin.symbol,
        type: "sell",
        amount: amountToSell,
        price: selectedCoin.current_price,
        date: new Date().toISOString(),
      });

      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
      await Notifications.scheduleNotificationAsync({
        content: { title: "Asset Sold! 📉", body: `Successfully sold ${amountToSell} ${selectedCoin.symbol}.`, sound: true },
        trigger: null,
      });
      setIsSellModalVisible(false);
      setSellAmount("");
      fetchPortfolio();
    } catch (_e) {
      Alert.alert("Error", "Transaction failed");
    }
  };

  const chartData = useMemo(() =>
    portfolioData.map((item, index) => ({
      name: item.symbol.toUpperCase(),
      population: item.currentVal || 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: theme.textColor,
      legendFontSize: 12,
    })), [portfolioData, theme.textColor]
  );

  // حسابات التحليلات
  const bestPerformer = useMemo(() =>
    portfolioData.length > 0 ? [...portfolioData].sort((a, b) => b.pl - a.pl)[0] : null,
    [portfolioData]);

  const worstPerformer = useMemo(() =>
    portfolioData.length > 0 ? [...portfolioData].sort((a, b) => a.pl - b.pl)[0] : null,
    [portfolioData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPortfolio(); }} tintColor={theme.textColor} />}
      >

        {/* Header Section */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textColor }]}>Portfolio</Text>
            <Text style={styles.headerSub}>Manage your digital assets</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsAnalyticsVisible(true)}
            style={[styles.iconCircle, { backgroundColor: theme.cardColor }]}
          >
            <Ionicons name="analytics" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <View style={styles.glassWrapper}>
          <LinearGradient
            colors={theme.isDarkMode ? ["#2563eb", "#1e40af", "#111827"] : ["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.summaryCardGradient}
          >
            <BlurView intensity={theme.isDarkMode ? 40 : 10} tint="dark" style={styles.blurContent}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryLabel}>ESTIMATED BALANCE</Text>
                <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.5)" />
              </View>
              <Text style={styles.summaryValue}>
                {currency.symbol}{toEn(totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
              </Text>
              <View style={[styles.plBadge, { backgroundColor: totalPL >= 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)" }]}>
                <Ionicons name={totalPL >= 0 ? "trending-up" : "trending-down"} size={14} color={totalPL >= 0 ? "#4ade80" : "#f87171"} />
                <Text style={[styles.plText, { color: totalPL >= 0 ? "#4ade80" : "#f87171" }]}>
                  {totalPL >= 0 ? "+" : ""}{toEn(totalPL.toFixed(2))} ({((totalPL / (totalValue || 1)) * 100).toFixed(2)}%)
                </Text>
              </View>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Chart Section */}
        {portfolioData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.cardColor }]}>
            <PieChart data={chartData} width={width - 40} height={180} chartConfig={{ color: () => `white` }} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
          </View>
        )}

        {/* Holdings List */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>My Holdings</Text>
          {portfolioData.map((item) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: "/details", params: item })}
              key={item.id}
              style={[styles.assetCard, { backgroundColor: theme.cardColor }]}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.image }} style={styles.coinIcon} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
                  <Text style={styles.coinAmount}>{toEn(item.amount.toFixed(4))} {item.symbol?.toUpperCase()}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.coinValue, { color: theme.textColor }]}>{currency.symbol}{toEn(item.currentVal?.toLocaleString("en-US", { minimumFractionDigits: 2 }))}</Text>
                  <Text style={{ color: item.pl >= 0 ? "#2ecc71" : "#e74c3c", fontSize: 13, fontWeight: "700" }}>
                    {item.pl >= 0 ? "▲" : "▼"} {toEn(Math.abs(item.pl).toFixed(2))}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: theme.isDarkMode ? "#333" : "#f5f5f5" }]}>
                <TouchableOpacity
                  onPress={() => { setSelectedCoin(item); setIsSellModalVisible(true); }}
                  style={styles.sellAction}
                >
                  <Ionicons name="flash" size={14} color="#ff3b30" />
                  <Text style={styles.sellActionText}>QUICK SELL</Text>
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color="#888" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* MODAL ANALYTICS */}
      <Modal visible={isAnalyticsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.cardColor, height: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Insights</Text>
              <TouchableOpacity onPress={() => setIsAnalyticsVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={[styles.insightCard, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                <Ionicons name="trending-up" size={24} color="#2ecc71" />
                <View style={{ marginLeft: 15 }}>
                  <Text style={{ color: '#888', fontSize: 12 }}>Top Performer</Text>
                  <Text style={[styles.insightValue, { color: '#2ecc71' }]}>{bestPerformer ? bestPerformer.name : 'N/A'}</Text>
                </View>
              </View>
              <View style={[styles.insightCard, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <Ionicons name="trending-down" size={24} color="#e74c3c" />
                <View style={{ marginLeft: 15 }}>
                  <Text style={{ color: '#888', fontSize: 12 }}>Worst Performer</Text>
                  <Text style={[styles.insightValue, { color: '#e74c3c' }]}>{worstPerformer ? worstPerformer.name : 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.aiTipBox}>
                <Text style={styles.aiTipTitle}>💡 Strategy Tip</Text>
                <Text style={styles.aiTipText}>
                  {totalPL >= 0 ? "You're in profit! Consider diversifying into stablecoins to lock in gains." : "Market dip detected. Focus on long-term holding or DCA into strong projects."}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL SELL */}
      <Modal visible={isSellModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.cardColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Sell {selectedCoin?.symbol?.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setIsSellModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubText}>Balance: {selectedCoin?.amount} units</Text>
            <TextInput
              style={[styles.input, { color: theme.textColor, borderColor: theme.isDarkMode ? "#444" : "#ddd" }]}
              placeholder="0.00" placeholderTextColor="#555" keyboardType="numeric"
              value={sellAmount} onChangeText={setSellAmount} autoFocus
            />
            <TouchableOpacity style={styles.confirmSellBtn} onPress={handleSell}>
              <Text style={styles.confirmBtnText}>Confirm Sale</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 15, marginBottom: 15 },
  headerTitle: { fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  headerSub: { color: "#888", fontSize: 13, fontWeight: "500" },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  glassWrapper: { margin: 20, borderRadius: 35, overflow: 'hidden', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  summaryCardGradient: { borderRadius: 35 },
  blurContent: { padding: 25 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  summaryValue: { color: "#fff", fontSize: 40, fontWeight: "900", marginBottom: 12 },
  plBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 5 },
  plText: { fontSize: 14, fontWeight: "800" },
  chartCard: { marginHorizontal: 20, padding: 15, borderRadius: 30, marginBottom: 25 },
  listSection: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 22, fontWeight: "900", marginBottom: 15 },
  assetCard: { padding: 18, borderRadius: 28, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  coinIcon: { width: 48, height: 48, borderRadius: 24 },
  coinName: { fontSize: 18, fontWeight: "800" },
  coinAmount: { color: "#888", fontSize: 13, fontWeight: "600", marginTop: 2 },
  coinValue: { fontSize: 18, fontWeight: "900" },
  cardFooter: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sellAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sellActionText: { color: "#ff3b30", fontSize: 12, fontWeight: "800" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { width: "88%", padding: 25, borderRadius: 35 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: "900" },
  modalSubText: { color: "#888", fontSize: 13, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 20, padding: 18, fontSize: 32, textAlign: "center", marginBottom: 25, fontWeight: '700' },
  confirmSellBtn: { backgroundColor: "#ff3b30", paddingVertical: 18, borderRadius: 22, alignItems: 'center' },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  insightCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 22, marginBottom: 15 },
  insightValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  aiTipBox: { padding: 20, borderRadius: 22, backgroundColor: '#000', marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  aiTipTitle: { color: '#007AFF', fontWeight: '900', marginBottom: 5 },
  aiTipText: { color: '#ccc', fontSize: 14, lineHeight: 20 },
});