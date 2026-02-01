// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   RefreshControl,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { useTheme } from "../../src/context/ThemeContext";

// const { width } = Dimensions.get("window");

// export default function PortfolioScreen() {
//   const { theme, isDarkMode, currency } = useTheme();
//   const router = useRouter();

//   const [portfolioData, setPortfolioData] = useState<any[]>([]);
//   const [totalValue, setTotalValue] = useState(0);
//   const [totalPL, setTotalPL] = useState(0);
//   const [refreshing, setRefreshing] = useState(false);

//   // جلب البيانات من الـ API والـ Storage
//   const fetchPortfolio = useCallback(async () => {
//     try {
//       const userData = await AsyncStorage.getItem("registeredUser");
//       const email = userData ? JSON.parse(userData).email : "guest";
//       const key = `portfolio_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;

//       const savedPortfolio = await AsyncStorage.getItem(key);
//       if (!savedPortfolio) {
//         setPortfolioData([]);
//         setTotalValue(0);
//         return;
//       }

//       const localAssets = JSON.parse(savedPortfolio);
//       const ids = localAssets.map((a: any) => a.id).join(",");

//       // جلب الأسعار الحالية
//       const response = await fetch(
//         `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
//       );
//       const marketData = await response.json();

//       let currentTotal = 0;
//       let currentPL = 0;

//       const mergedData = localAssets.map((local: any) => {
//         const market = marketData.find((m: any) => m.id === local.id);
//         if (market) {
//           const currentVal = market.current_price * local.amount * currency.rate;
//           const entryVal = (local.entryPrice || market.current_price) * local.amount * currency.rate;
//           const pl = currentVal - entryVal;

//           currentTotal += currentVal;
//           currentPL += pl;

//           return { ...local, ...market, currentVal, pl };
//         }
//         return local;
//       });

//       setPortfolioData(mergedData);
//       setTotalValue(currentTotal);
//       setTotalPL(currentPL);
//     } catch (error) {
//       console.error("Portfolio Fetch Error:", error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [currency.rate]);

//   useEffect(() => {
//     fetchPortfolio();
//   }, [fetchPortfolio]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchPortfolio();
//   };

//   const renderItem = ({ item }: any) => {
//     const isProfit = item.pl >= 0;
//     return (
//       <TouchableOpacity
//         style={[styles.assetCard, { backgroundColor: theme.cardColor }]}
//         onPress={() => router.push({ pathname: "/details", params: item })}
//       >
//         <Image source={{ uri: item.image }} style={styles.coinIcon} />
//         <View style={{ flex: 1, marginLeft: 12 }}>
//           <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
//           <Text style={styles.coinAmount}>{item.amount.toFixed(4)} {item.symbol?.toUpperCase()}</Text>
//         </View>
//         <View style={{ alignItems: 'flex-end' }}>
//           <Text style={[styles.coinValue, { color: theme.textColor }]}>
//             {currency.symbol}{item.currentVal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//           </Text>
//           <View style={[styles.plBadge, { backgroundColor: isProfit ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)' }]}>
//             <Text style={[styles.plText, { color: isProfit ? '#2ecc71' : '#e74c3c' }]}>
//               {isProfit ? '+' : ''}{item.pl?.toFixed(2)}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>

//       {/* Header Summary */}
//       <View style={[styles.summaryCard, { backgroundColor: '#007AFF' }]}>
//         <Text style={styles.summaryLabel}>Total Balance</Text>
//         <Text style={styles.summaryValue}>
//           {currency.symbol}{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//         </Text>
//         <View style={styles.totalPLRow}>
//           <Ionicons name={totalPL >= 0 ? "trending-up" : "trending-down"} size={16} color="#fff" />
//           <Text style={styles.totalPLText}>
//             Total Profit: {totalPL >= 0 ? "+" : ""}{totalPL.toFixed(2)} {currency.label}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.listHeader}>
//         <Text style={[styles.listTitle, { color: theme.textColor }]}>Your Assets</Text>
//         <TouchableOpacity onPress={onRefresh}>
//           <Ionicons name="refresh" size={20} color="#888" />
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={portfolioData}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="wallet-outline" size={80} color="#ccc" />
//             <Text style={styles.emptyText}>Your portfolio is empty. Add coins from the market!</Text>
//           </View>
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   summaryCard: {
//     margin: 20,
//     padding: 25,
//     borderRadius: 30,
//     shadowColor: "#007AFF",
//     shadowOpacity: 0.4,
//     shadowRadius: 15,
//     elevation: 10
//   },
//   summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
//   summaryValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 8 },
//   totalPLRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
//   totalPLText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 5 },

//   listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
//   listTitle: { fontSize: 18, fontWeight: '800' },

//   assetCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderRadius: 22,
//     marginBottom: 12,
//   },
//   coinIcon: { width: 45, height: 45, borderRadius: 22 },
//   coinName: { fontSize: 16, fontWeight: '700' },
//   coinAmount: { color: '#888', fontSize: 13, marginTop: 2 },
//   coinValue: { fontSize: 16, fontWeight: '800' },
//   plBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
//   plText: { fontSize: 12, fontWeight: 'bold' },

//   emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
//   emptyText: { color: '#888', textAlign: 'center', marginTop: 20, lineHeight: 22 }
// });
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { PieChart } from "react-native-chart-kit"; // مكتبة الرسم البياني
import { useTheme } from "../../src/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function PortfolioScreen() {
  const { theme, isDarkMode, currency } = useTheme();
  const router = useRouter();

  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPL, setTotalPL] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // ألوان عشوائية جذابة للرسم البياني
  const chartColors = ["#007AFF", "#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6", "#34495e"];

  const fetchPortfolio = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const key = `portfolio_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;

      const savedPortfolio = await AsyncStorage.getItem(key);
      if (!savedPortfolio) {
        setPortfolioData([]);
        setTotalValue(0);
        return;
      }

      const localAssets = JSON.parse(savedPortfolio);
      const ids = localAssets.map((a: any) => a.id).join(",");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
      );
      const marketData = await response.json();

      let currentTotal = 0;
      let currentPL = 0;

      const mergedData = localAssets.map((local: any) => {
        const market = marketData.find((m: any) => m.id === local.id);
        if (market) {
          const currentVal = market.current_price * local.amount * currency.rate;
          const entryVal = (local.entryPrice || market.current_price) * local.amount * currency.rate;
          const pl = currentVal - entryVal;

          currentTotal += currentVal;
          currentPL += pl;

          return { ...local, ...market, currentVal, pl };
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

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // تحضير بيانات الرسم البياني
  const chartData = useMemo(() => {
    return portfolioData.map((item, index) => ({
      name: item.symbol.toUpperCase(),
      population: item.currentVal,
      color: chartColors[index % chartColors.length],
      legendFontColor: theme.textColor,
      legendFontSize: 12,
    }));
  }, [portfolioData, theme.textColor]);

  const renderItem = ({ item }: any) => {
    const isProfit = item.pl >= 0;
    return (
      <TouchableOpacity
        style={[styles.assetCard, { backgroundColor: theme.cardColor }]}
        onPress={() => router.push({ pathname: "/details", params: item })}
      >
        <Image source={{ uri: item.image }} style={styles.coinIcon} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
          <Text style={styles.coinAmount}>{item.amount.toFixed(4)} {item.symbol?.toUpperCase()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.coinValue, { color: theme.textColor }]}>
            {currency.symbol}{item.currentVal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={{ color: isProfit ? '#2ecc71' : '#e74c3c', fontSize: 12, fontWeight: '700' }}>
            {isProfit ? '▲' : '▼'} {Math.abs(item.pl).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPortfolio(); }} />}
      >
        {/* Header Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: '#007AFF' }]}>
          <Text style={styles.summaryLabel}>Total Net Worth</Text>
          <Text style={styles.summaryValue}>
            {currency.symbol}{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <View style={[styles.plBadge, { backgroundColor: totalPL >= 0 ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)' }]}>
            <Text style={styles.plText}>
              {totalPL >= 0 ? "Profit" : "Loss"}: {totalPL >= 0 ? "+" : ""}{totalPL.toFixed(2)} {currency.label}
            </Text>
          </View>
        </View>

        {/* Pie Chart Section */}
        {portfolioData.length > 0 && (
          <View style={[styles.chartContainer, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.chartTitle, { color: theme.textColor }]}>Asset Allocation</Text>
            <PieChart
              data={chartData}
              width={width - 40}
              height={180}
              chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute // يعرض القيم الحقيقية بدل النسب لو أردت
            />
          </View>
        )}

        {/* Asset List */}
        <View style={styles.listSection}>
          <Text style={[styles.listTitle, { color: theme.textColor }]}>My Holdings</Text>
          {portfolioData.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem({ item })}
            </React.Fragment>
          ))}
          {portfolioData.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="pie-chart-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No assets to display. Start by adding some coins!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: { margin: 20, padding: 25, borderRadius: 32, elevation: 10, shadowColor: "#007AFF", shadowOpacity: 0.3, shadowRadius: 15 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { color: '#fff', fontSize: 34, fontWeight: '900', marginVertical: 10 },
  plBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  plText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  chartContainer: { marginHorizontal: 20, padding: 15, borderRadius: 25, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10, marginLeft: 10 },

  listSection: { paddingHorizontal: 20, paddingBottom: 40 },
  listTitle: { fontSize: 18, fontWeight: '900', marginBottom: 15, marginLeft: 5 },

  assetCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 22, marginBottom: 12 },
  coinIcon: { width: 44, height: 44, borderRadius: 22 },
  coinName: { fontSize: 16, fontWeight: '700' },
  coinAmount: { color: '#888', fontSize: 12, marginTop: 2, fontWeight: '600' },
  coinValue: { fontSize: 16, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 15, fontSize: 14 }
});