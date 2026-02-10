import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, Alert as RNAlert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { toEn } from "../src/utils/formatters";

export default function AlertsScreen() {
    const { theme, currency } = useTheme();
    const router = useRouter();
    const { alerts, fetchAlerts, removeAlert } = usePriceAlerts();

    useFocusEffect(
        useCallback(() => {
            fetchAlerts();
        }, [fetchAlerts])
    );

    const handleDeletePress = (id: string) => {
        RNAlert.alert("Remove Alert", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => removeAlert(id) }
        ]);
    };

    const renderAlertItem = ({ item }: { item: any }) => {
        const isActive = item.active !== false;
        const color = isActive ? (item.type === 'UP' ? "#2ecc71" : "#e74c3c") : "#8e8e93";

        return (
            <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={item.type === 'UP' ? "trending-up" : "trending-down"} size={22} color={color} />
                </View>

                <View style={styles.info}>
                    <View style={styles.row}>
                        <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
                        <View style={[styles.badge, { backgroundColor: isActive ? "#007AFF20" : "#8e8e9320" }]}>
                            <Text style={[styles.badgeText, { color: isActive ? "#007AFF" : "#8e8e93" }]}>
                                {isActive ? "WATCHING" : "FINISHED"}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.targetText}>Notify at {currency.symbol}{toEn(item.targetPrice.toLocaleString())}</Text>
                </View>

                <TouchableOpacity onPress={() => handleDeletePress(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#ff4757" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.cardColor }]}>
                    <Ionicons name="chevron-back" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: theme.textColor }]}>Price Alerts</Text>
                    <Text style={styles.subTitle}>{alerts.length} alerts configured</Text>
                </View>
            </View>

            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                renderItem={renderAlertItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<EmptyState theme={theme} />}
            />
        </SafeAreaView>
    );
}

const EmptyState = ({ theme }: any) => (
    <View style={styles.empty}>
        <View style={styles.emptyIconBox}>
            <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
        </View>
        <Text style={[styles.emptyText, { color: theme.textColor }]}>No active alerts</Text>
        <Text style={styles.emptySubText}>Set an alert from the coin details screen.</Text>
    </View>
);


const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 10
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        elevation: 2
    },
    title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
    subTitle: { color: "#888", fontSize: 13, fontWeight: "500" },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    info: { flex: 1, marginLeft: 15 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    coinName: { fontSize: 17, fontWeight: "800" },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: "900" },
    targetText: { color: "#888", fontSize: 13, marginTop: 4, fontWeight: "500" },
    deleteBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    empty: { alignItems: 'center', marginTop: 120, paddingHorizontal: 40 },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyText: { fontSize: 20, fontWeight: "800" },
    emptySubText: { color: "#888", textAlign: 'center', marginTop: 8, lineHeight: 20 },
});