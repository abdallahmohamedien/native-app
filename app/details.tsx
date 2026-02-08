import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

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
  if (num === undefined || num === null) return '---';
  return num.toString().replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

export default function DetailsScreen() {
  const item = useLocalSearchParams();
  const router = useRouter();
  const { theme, currency } = useTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  // إضافات تنبيه الأسعار
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') console.log('Notification permissions denied');
    })();
  }, []);

  const triggerNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  };

  const handleAddToPortfolio = async () => {
    const buyAmount = Number(amount);
    if (!amount || isNaN(buyAmount) || buyAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const storageKey = `portfolio_${userSuffix}`;
      const historyKey = `history_${userSuffix}`;

      const savedPortfolio = await AsyncStorage.getItem(storageKey);
      let portfolio = savedPortfolio ? JSON.parse(savedPortfolio) : [];
      const existingIndex = portfolio.findIndex((p: any) => p.id === item.id);

      if (existingIndex > -1) {
        portfolio[existingIndex].amount += buyAmount;
      } else {
        portfolio.push({
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          image: item.image,
          amount: buyAmount,
          entryPrice: Number(item.current_price)
        });
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(portfolio));

      const savedHistory = await AsyncStorage.getItem(historyKey);
      let history = savedHistory ? JSON.parse(savedHistory) : [];
      history.unshift({
        id: Math.random().toString(36).substr(2, 9),
        coinId: item.id,
        name: item.name,
        symbol: item.symbol,
        type: 'buy',
        amount: buyAmount,
        price: Number(item.current_price),
        date: new Date().toISOString(),
      });
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));

      triggerNotification("Trade Executed! ✅", `You successfully added ${amount} ${item.name} to your portfolio.`);
      setIsModalVisible(false);
      setAmount('');
    } catch (error) {
      Alert.alert("Error", "Could not save transaction");
    }
  };

  // دالة حفظ التنبيه
  const handleSetAlert = async () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("registeredUser");
      const email = userData ? JSON.parse(userData).email : "guest";
      const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const alertKey = `alerts_${userSuffix}`;

      const savedAlerts = await AsyncStorage.getItem(alertKey);
      let alerts = savedAlerts ? JSON.parse(savedAlerts) : [];

      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        coinId: item.id,
        name: item.name,
        targetPrice: price,
        currentAtCreation: Number(item.current_price),
        type: price > Number(item.current_price) ? 'UP' : 'DOWN',
        active: true,
        createdAt: new Date().toISOString()
      });

      await AsyncStorage.setItem(alertKey, JSON.stringify(alerts));
      Alert.alert("Success", `We will notify you when ${item.name} hits ${currency.symbol}${toEn(price)}`);
      setIsAlertModalVisible(false);
      setTargetPrice('');
    } catch (error) {
      Alert.alert("Error", "Failed to set alert");
    }
  };

  const chartData = {
    labels: ["1h", "4h", "8h", "12h", "18h", "24h"],
    datasets: [{ data: [Math.random() * 10, Math.random() * 12, Math.random() * 9, Math.random() * 15, Math.random() * 11, Math.random() * 14] }]
  };

  const isProfit = Number(item.price_change_percentage_24h) >= 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.cardColor }]}>
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Asset Details</Text>

        {/* زر التنبيه الجديد */}
        <TouchableOpacity onPress={() => setIsAlertModalVisible(true)} style={[styles.backBtn, { backgroundColor: theme.cardColor }]}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Image source={{ uri: item.image as string }} style={styles.coinIcon} />
          <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
          <Text style={styles.coinSymbol}>{item.symbol?.toString().toUpperCase()}</Text>
          <Text style={[styles.currentPrice, { color: theme.textColor }]}>
            {currency.symbol}{toEn(Number(item.current_price).toLocaleString('en-US'))}
          </Text>
          <View style={[styles.priceBadge, { backgroundColor: isProfit ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)' }]}>
            <Ionicons name={isProfit ? "trending-up" : "trending-down"} size={16} color={isProfit ? '#2ecc71' : '#e74c3c'} />
            <Text style={[styles.priceChangeText, { color: isProfit ? '#2ecc71' : '#e74c3c' }]}>
              {isProfit ? '+' : ''}{toEn(Number(item.price_change_percentage_24h).toFixed(2))}%
            </Text>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={width - 20}
            height={220}
            chartConfig={{
              backgroundColor: theme.backgroundColor,
              backgroundGradientFrom: theme.backgroundColor,
              backgroundGradientTo: theme.backgroundColor,
              decimalPlaces: 2,
              color: (opacity = 1) => isProfit ? `rgba(46, 204, 113, ${opacity})` : `rgba(231, 76, 60, ${opacity})`,
              labelColor: () => theme.textColor,
              propsForDots: { r: "0" },
              fillShadowGradient: isProfit ? '#2ecc71' : '#e74c3c',
              fillShadowGradientOpacity: 0.1,
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Market Statistics</Text>
          <View style={styles.statsGrid}>
            <StatItem label="Rank" value={`#${toEn(item.market_cap_rank as string || '1')}`} theme={theme} />
            <StatItem label="High 24h" value={`${currency.symbol}${toEn(Number(item.high_24h).toLocaleString('en-US'))}`} theme={theme} />
            <StatItem label="Low 24h" value={`${currency.symbol}${toEn(Number(item.low_24h).toLocaleString('en-US'))}`} theme={theme} />
            <StatItem label="Volume" value={`${toEn(Number(item.total_volume).toLocaleString('en-US'))}`} theme={theme} />
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.actionBtnText}>Buy {item.symbol?.toString().toUpperCase()}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal الشراء الأصلي */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Buy {item.name}</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.textColor, borderColor: theme.isDarkMode ? '#444' : '#ddd' }]}
              placeholder="0.00"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee' }]} onPress={() => setIsModalVisible(false)}>
                <Text style={{ color: '#000' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#007AFF' }]} onPress={handleAddToPortfolio}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm Buy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Modal تنبيه السعر الجديد */}
      <Modal visible={isAlertModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardColor }]}>
            <Ionicons name="notifications" size={40} color="#007AFF" style={{ marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Set Price Alert</Text>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 20 }}>
              Notify me when {item.name} price reaches:
            </Text>
            <TextInput
              style={[styles.modalInput, { color: theme.textColor, borderColor: theme.isDarkMode ? '#444' : '#ddd' }]}
              placeholder={`${currency.symbol}0.00`}
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={setTargetPrice}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee' }]} onPress={() => setIsAlertModalVisible(false)}>
                <Text style={{ color: '#000' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#007AFF' }]} onPress={handleSetAlert}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Set Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatItem({ label, value, theme }: any) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.cardColor }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  headerCard: { alignItems: 'center', paddingVertical: 20 },
  coinIcon: { width: 80, height: 80, marginBottom: 15 },
  coinName: { fontSize: 26, fontWeight: '900' },
  coinSymbol: { fontSize: 16, color: '#888', fontWeight: '600', marginBottom: 10 },
  currentPrice: { fontSize: 38, fontWeight: '900' },
  priceBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 10 },
  priceChangeText: { fontWeight: '800', fontSize: 16, marginLeft: 5 },
  chartWrapper: { alignItems: 'center', marginTop: 10 },
  chart: { marginVertical: 8, borderRadius: 16 },
  statsContainer: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', padding: 18, borderRadius: 24, marginBottom: 15 },
  statLabel: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '800' },
  actionBtn: { backgroundColor: '#007AFF', margin: 20, padding: 18, borderRadius: 20, alignItems: 'center', marginBottom: 40 },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  modalInput: { width: '100%', height: 60, borderWidth: 1, borderRadius: 15, paddingHorizontal: 20, fontSize: 20, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalBtn: { flex: 1, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 }
});