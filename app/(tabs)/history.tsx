import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";


const toEn = (num: string | number) => {
    if (num === undefined || num === null) return '---';
    return num.toString().replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

export default function HistoryScreen() {
    const { theme, currency } = useTheme();
    const [history, setHistory] = useState<any[]>([]);

    const fetchHistory = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem("registeredUser");
            const email = userData ? JSON.parse(userData).email : "guest";
            const historyKey = `history_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;

            const savedHistory = await AsyncStorage.getItem(historyKey);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const renderTransaction = ({ item }: { item: any }) => {
        const isBuy = item.type === "buy";


        const rawDate = new Date(item.date).toLocaleDateString('en-US');
        const rawTime = new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
                <View style={[styles.iconContainer, { backgroundColor: isBuy ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)" }]}>
                    <Ionicons
                        name={isBuy ? "arrow-down-circle" : "arrow-up-circle"}
                        size={30}
                        color={isBuy ? "#2ecc71" : "#e74c3c"}
                    />
                </View>

                <View style={styles.details}>
                    <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
                    <Text style={styles.dateText}>{toEn(rawDate)} • {toEn(rawTime)}</Text>
                </View>

                <View style={styles.values}>
                    <Text style={[styles.amount, { color: isBuy ? "#2ecc71" : "#e74c3c" }]}>
                        {isBuy ? "+" : "-"}{toEn(item.amount)} {item.symbol?.toUpperCase()}
                    </Text>
                    <Text style={styles.price}>
                        Price: {currency.symbol}{toEn(item.price.toLocaleString('en-US'))}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textColor }]}>Activity History</Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyText}>No transactions yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, marginTop: 10 },
    title: { fontSize: 28, fontWeight: "900" },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    details: { flex: 1, marginLeft: 15 },
    coinName: { fontSize: 16, fontWeight: "800" },
    dateText: { color: "#888", fontSize: 12, marginTop: 4 },
    values: { alignItems: "flex-end" },
    amount: { fontSize: 16, fontWeight: "900" },
    price: { color: "#888", fontSize: 11, marginTop: 4 },
    emptyState: { alignItems: "center", marginTop: 100 },
    emptyText: { color: "#ccc", fontSize: 18, marginTop: 10, fontWeight: "600" },
});