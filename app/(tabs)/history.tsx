/* cspell:ignore Haptics */
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useHistory } from "../../hooks/useHistory";
import { useTheme } from "../../src/context/ThemeContext";

const toEn = (num: string | number) => {
    if (num === undefined || num === null) return '---';
    return num.toString().replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

export default function HistoryScreen() {
    const { theme, currency } = useTheme();
    const { filter, filteredHistory, fetchHistory, handleFilterPress } = useHistory();

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const renderTransaction = ({ item }: { item: any }) => {
        const isBuy = item.type === "buy";
        const dateObj = new Date(item.date);
        const rawTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const rawDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return (
            <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                    <View style={[styles.timelineLine, { backgroundColor: theme.isDarkMode ? "#333" : "#eee" }]} />
                    <View style={[styles.timelineDot, { backgroundColor: isBuy ? "#2ecc71" : "#e74c3c", borderColor: theme.backgroundColor }]} />
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
                    <View style={[styles.iconContainer, { backgroundColor: isBuy ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)" }]}>
                        <Ionicons
                            name={isBuy ? "download-outline" : "share-outline"}
                            size={22}
                            color={isBuy ? "#2ecc71" : "#e74c3c"}
                        />
                    </View>

                    <View style={styles.details}>
                        <View style={styles.row}>
                            <Text style={[styles.coinName, { color: theme.textColor }]}>{item.name}</Text>
                            <View style={[styles.typeTag, { backgroundColor: isBuy ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)" }]}>
                                <Text style={[styles.typeTagText, { color: isBuy ? "#2ecc71" : "#e74c3c" }]}>
                                    {item.type?.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.dateText}>{toEn(rawDate)} • {toEn(rawTime)}</Text>
                    </View>

                    <View style={styles.values}>
                        <Text style={[styles.amount, { color: isBuy ? "#2ecc71" : "#e74c3c" }]}>
                            {isBuy ? "+" : "-"}{toEn(item.amount)}
                        </Text>
                        <Text style={styles.price}>
                            {currency.symbol}{toEn(item.price.toLocaleString('en-US'))}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.textColor }]}>Activity</Text>
                    <Text style={styles.subTitle}>
                        {filter === 'all' ? 'All Transactions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Assets`}
                    </Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleFilterPress}
                    style={[
                        styles.filterBtn,
                        {
                            backgroundColor: theme.cardColor,
                            borderColor: filter !== 'all' ? "#007AFF" : "transparent",
                            borderWidth: 1
                        }
                    ]}
                >
                    <Ionicons
                        name={filter === 'all' ? "filter-outline" : "filter"}
                        size={20}
                        color={filter !== 'all' ? "#007AFF" : theme.textColor}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: theme.cardColor }]}>
                            <Ionicons name="receipt-outline" size={50} color="#666" />
                        </View>
                        <Text style={[styles.emptyText, { color: theme.textColor }]}>No records found</Text>
                        <Text style={styles.emptySubText}>Try changing the filter or start trading</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 15, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: "900", letterSpacing: -0.5 },
    subTitle: { color: "#888", fontSize: 14, fontWeight: "500", marginTop: 2 },
    filterBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    listContent: { paddingHorizontal: 20, paddingBottom: 50 },
    timelineItem: { flexDirection: 'row' },
    timelineLeft: { alignItems: 'center', width: 20, marginRight: 10 },
    timelineLine: { width: 2, flex: 1 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, position: 'absolute', top: 25, zIndex: 1, borderWidth: 2 },
    card: { flex: 1, flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 24, marginBottom: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    details: { flex: 1, marginLeft: 15 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    coinName: { fontSize: 16, fontWeight: "800" },
    typeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    typeTagText: { fontSize: 9, fontWeight: "900" },
    dateText: { color: "#888", fontSize: 11, marginTop: 4, fontWeight: "500" },
    values: { alignItems: "flex-end" },
    amount: { fontSize: 16, fontWeight: "900" },
    price: { color: "#999", fontSize: 12, marginTop: 4, fontWeight: "600" },
    emptyState: { alignItems: "center", marginTop: 120, paddingHorizontal: 40 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { fontSize: 20, fontWeight: "800" },
    emptySubText: { color: "#888", textAlign: 'center', marginTop: 8, lineHeight: 20 },
});