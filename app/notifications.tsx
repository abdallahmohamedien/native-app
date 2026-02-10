/* cspell:ignore anims */
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Notification, useNotifications } from "../hooks/useNotifications";
import { useTheme } from "../src/context/ThemeContext";

export default function NotificationsScreen() {
    const { theme, isDarkMode } = useTheme();
    const { notifications, clearNotifications } = useNotifications();

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'security': return "shield-checkmark";
            case 'market': return "trending-up";
            default: return "notifications";
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                title: "Notifications",
                headerShown: true,
                headerTintColor: theme.textColor,
                headerStyle: { backgroundColor: theme.backgroundColor },
                headerRight: () => (
                    <TouchableOpacity onPress={clearNotifications} style={{ marginRight: 10 }}>
                        <Text style={{ color: "#007AFF", fontWeight: "600" }}>Clear All</Text>
                    </TouchableOpacity>
                )
            }} />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={[styles.notifCard, { backgroundColor: theme.cardColor, borderColor: isDarkMode ? '#333' : '#eee' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: item.type === 'security' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(0,122,255,0.1)' }]}>
                            <Ionicons
                                name={getIcon(item.type)}
                                size={20}
                                color={item.type === 'security' ? '#2ecc71' : '#007AFF'}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.notifTitle, { color: theme.textColor }]}>{item.title}</Text>
                                <Text style={styles.notifTime}>{item.time}</Text>
                            </View>
                            <Text style={[styles.notifBody, { color: isDarkMode ? '#aaa' : '#666' }]}>{item.body}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={60} color="#444" />
                        <Text style={styles.emptyText}>Inbox is empty</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 40 },
    notifCard: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: "flex-start",
        borderWidth: 1
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center"
    },
    textContainer: { flex: 1, marginLeft: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    notifTitle: { fontSize: 16, fontWeight: "700" },
    notifBody: { fontSize: 14, marginTop: 4, lineHeight: 20 },
    notifTime: { fontSize: 11, color: "#888", fontWeight: '500' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { textAlign: "center", color: "#888", marginTop: 15, fontSize: 16, fontWeight: '500' },
});