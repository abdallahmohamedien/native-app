import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

// الاستدعاءات الصحيحة للملفات اللي نقلناها
import { useAssetActions } from '../hooks/useAssetActions';
import { usePriceAlertManager } from '../hooks/usePriceAlertManager';
import { useTheme } from '../src/context/ThemeContext';
import { toEn } from '../src/utils/formatters';

const { width } = Dimensions.get('window');

export default function DetailsScreen() {
  const item = useLocalSearchParams();
  const router = useRouter();
  const { theme, currency } = useTheme();

  // Modals States
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  // استخدام الـ Hooks الجديدة
  const { amount, setAmount, addToPortfolio } = useAssetActions(item);
  const { targetPrice, setTargetPrice, saveAlert } = usePriceAlertManager(item);

  const isProfit = Number(item.price_change_percentage_24h) >= 0;

  // بيانات الرسم البياني (ممكن تنقلها لـ Hook مستقبلاً)
  const chartData = {
    labels: ["1h", "4h", "8h", "12h", "18h", "24h"],
    datasets: [{ data: [Math.random() * 10, Math.random() * 12, Math.random() * 9, Math.random() * 15, Math.random() * 11, Math.random() * 14] }]
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.cardColor }]}>
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Asset Details</Text>
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
              color: (opacity = 1) => isProfit ? `rgba(46, 204, 113, ${opacity})` : `rgba(231, 76, 60, ${opacity})`,
              labelColor: () => theme.textColor,
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsBuyModalVisible(true)}>
          <Text style={styles.actionBtnText}>Buy {item.symbol?.toString().toUpperCase()}</Text>
        </TouchableOpacity>
      </ScrollView>


      <CustomModal
        visible={isBuyModalVisible}
        onClose={() => setIsBuyModalVisible(false)}
        title={`Buy ${item.name}`}
        value={amount}
        setValue={setAmount}
        onConfirm={() => addToPortfolio(() => setIsBuyModalVisible(false))}
        theme={theme}
      />

      <CustomModal
        visible={isAlertModalVisible}
        onClose={() => setIsAlertModalVisible(false)}
        title="Set Price Alert"
        value={targetPrice}
        setValue={setTargetPrice}
        onConfirm={() => saveAlert(() => setIsAlertModalVisible(false))}
        theme={theme}
      />
    </SafeAreaView>
  );
}


function CustomModal({ visible, onClose, title, value, setValue, onConfirm, theme }: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardColor }]}>
          <Text style={[styles.modalTitle, { color: theme.textColor }]}>{title}</Text>
          <TextInput
            style={[styles.modalInput, { color: theme.textColor, borderColor: '#8882' }]}
            placeholder="0.00"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee' }]} onPress={onClose}>
              <Text style={{ color: '#000' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#007AFF' }]} onPress={onConfirm}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  chartWrapper: { alignItems: 'center', marginTop: 10 },
  chart: { marginVertical: 8, borderRadius: 16 },
  actionBtn: { backgroundColor: '#007AFF', margin: 20, padding: 18, borderRadius: 20, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  modalInput: { width: '100%', height: 60, borderWidth: 1, borderRadius: 15, paddingHorizontal: 20, fontSize: 20, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalBtn: { flex: 1, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 }
});