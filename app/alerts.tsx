import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";

const toEn = (num: string | number) => {
    if (num === undefined || num === null) return '---';
    return num.toString().replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

export default function AlertsScreen() {
    const { theme, currency } = useTheme();
    const router = useRouter();
    const [alerts, setAlerts] = useState<any[]>([]);

    const fetchAlerts = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem("registeredUser");
            const email = userData ? JSON.parse(userData).email : "guest";
            const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
            const alertKey = `alerts_${userSuffix}`;

            const savedAlerts = await AsyncStorage.getItem(alertKey);
            if (savedAlerts) {
                setAlerts(JSON.parse(savedAlerts));
            }
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAlerts();
        }, [fetchAlerts])
    );

    const deleteAlert = async (id: string) => {
        const updatedAlerts = alerts.filter(a => a.id !== id);
        setAlerts(updatedAlerts);

        const userData = await AsyncStorage.getItem("registeredUser");
        const email = userData ? JSON.parse(userData).email : "guest";
        const userSuffix = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
        await AsyncStorage.setItem(`alerts_${userSuffix}`, JSON.stringify(updatedAlerts));
    };

    const renderAlertItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
            <View style={[styles.iconBox, { backgroundColor: item.active ? 'rgba(0, 122, 255, 0.1)' : 'rgba(142, 142, 147, 0.1)' }]}>
                <Ionicons
                    name={item.type === 'UP' ? "trending-up" : "trending-down"}
                    size={24}
                    color={item.active ? "#007AFF" : "#8e8e93"}
                />
            </View>

            <View style={styles.info}>
                <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
                <Text style={styles.targetText}>
                    Target: {currency.symbol}{toEn(item.targetPrice.toLocaleString())}
                </Text>
                {!item.active && <Text style={styles.statusDone}>Triggered ✅</Text>}
            </View>

            <TouchableOpacity onPress={() => deleteAlert(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#ff4757" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.textColor }]}>Price Alerts</Text>
            </View>

            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                renderItem={renderAlertItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No alerts set yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    backBtn: { marginRight: 15 },
    title: { fontSize: 24, fontWeight: "900" },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        elevation: 2,
    },
    iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, marginLeft: 15 },
    coinName: { fontSize: 16, fontWeight: "800" },
    targetText: { color: "#888", fontSize: 14, marginTop: 2 },
    statusDone: { color: "#2ecc71", fontSize: 12, fontWeight: "700", marginTop: 4 },
    deleteBtn: { padding: 10 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#ccc', fontSize: 16, marginTop: 10 }
});