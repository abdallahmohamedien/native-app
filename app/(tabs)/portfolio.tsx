import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View
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
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [sellAmount, setSellAmount] = useState("");

  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  const triggerSellNotification = async (name: string, amount: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Asset Sold! 📉",
        body: `Successfully sold ${amount} of ${name}. Your portfolio updated.`,
        sound: true,
      },
      trigger: null,
    });
  };

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
          const entryVal =
            (local.entryPrice || market.current_price) *
            local.amount *
            currency.rate;
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
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, [currency.rate]);

  useFocusEffect(
    useCallback(() => {
      fetchPortfolio();
    }, [fetchPortfolio])
  );

  const handleSell = async () => {
    const amountToSell = parseFloat(sellAmount);
    if (
      isNaN(amountToSell) ||
      amountToSell <= 0 ||
      amountToSell > selectedCoin.amount
    ) {
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

      triggerSellNotification(selectedCoin.name, sellAmount);
      setIsSellModalVisible(false);
      setSellAmount("");
      fetchPortfolio();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Transaction failed");
    }
  };

  const chartData = useMemo(
    () =>
      portfolioData.map((item, index) => ({
        name: item.symbol.toUpperCase(),
        population: item.currentVal || 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: theme.textColor,
        legendFontSize: 12,
      })),
    [portfolioData, theme.textColor]
  );

  return (
    <>

      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPortfolio();
              }}
            />
          }
        >
          <Text style={[styles.listTitle, { paddingLeft: 20 }, { color: theme.textColor }]}>My Portfolio</Text>
          <View style={[styles.summaryCard, { backgroundColor: "#007AFF" }]}>
            <Text style={styles.summaryLabel}>Total Net Worth</Text>
            <Text style={styles.summaryValue}>
              {currency.symbol}
              {toEn(totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
            </Text>
            <View style={[styles.plBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.plText}>
                {totalPL >= 0 ? "Profit" : "Loss"}: {totalPL >= 0 ? "+" : ""}
                {toEn(totalPL.toFixed(2))} {currency.label}
              </Text>
            </View>
          </View>

          {portfolioData.length > 0 && (
            <View style={[styles.chartContainer, { backgroundColor: theme.cardColor }]}>
              <PieChart
                data={chartData}
                width={width - 40}
                height={180}
                chartConfig={{ color: () => `white` }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          )}

          <View style={styles.listSection}>
            <Text style={[styles.listTitle, { color: theme.textColor }]}>My Holdings</Text>
            {portfolioData.map((item) => (
              <View key={item.id} style={[styles.assetCard, { backgroundColor: theme.cardColor }]}>
                <View style={styles.cardHeader}>
                  <Image source={{ uri: item.image }} style={styles.coinIcon} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
                    <Text style={styles.coinAmount}>
                      {toEn(item.amount.toFixed(4))} {item.symbol?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.coinValue, { color: theme.textColor }]}>
                      {currency.symbol}
                      {toEn(
                        item.currentVal?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })
                      )}
                    </Text>
                    <Text
                      style={{
                        color: item.pl >= 0 ? "#2ecc71" : "#e74c3c",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {item.pl >= 0 ? "▲" : "▼"} {toEn(Math.abs(item.pl).toFixed(2))}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: "#007AFF", borderWidth: 1 }]}
                    onPress={() => router.push({ pathname: "/details", params: item })}
                  >
                    <Text style={{ color: "#007AFF", fontWeight: "700" }}>Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#ff3b30" }]}
                    onPress={() => {
                      setSelectedCoin(item);
                      setIsSellModalVisible(true);
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Sell</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <Modal visible={isSellModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardColor }]}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                Sell {selectedCoin?.name}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.textColor, borderColor: theme.isDarkMode ? "#444" : "#ddd" },
                ]}
                placeholder="0.00"
                keyboardType="numeric"
                value={sellAmount}
                onChangeText={setSellAmount}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsSellModalVisible(false)}>
                  <Text style={{ color: "#888", fontWeight: "700" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmSellBtn} onPress={handleSell}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Confirm Sell</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: { margin: 20, padding: 25, borderRadius: 32 },
  summaryLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700" },
  summaryValue: { color: "#fff", fontSize: 34, fontWeight: "900", marginVertical: 10 },
  plBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  plText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  chartContainer: { marginHorizontal: 20, padding: 15, borderRadius: 25, marginBottom: 20 },
  listSection: { paddingHorizontal: 20, paddingBottom: 40 },
  listTitle: { fontSize: 18, fontWeight: "900", marginBottom: 15 },
  assetCard: { padding: 16, borderRadius: 22, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  coinIcon: { width: 44, height: 44, borderRadius: 22 },
  coinName: { fontSize: 16, fontWeight: "700" },
  coinAmount: { color: "#888", fontSize: 12 },
  coinValue: { fontSize: 16, fontWeight: "800" },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15, gap: 10 },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", padding: 25, borderRadius: 30 },
  modalTitle: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 15, padding: 15, fontSize: 22, textAlign: "center", marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 20, alignItems: "center" },
  cancelBtn: { padding: 10 },
  confirmSellBtn: { backgroundColor: "#ff3b30", paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
});
