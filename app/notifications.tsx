import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../src/context/ThemeContext";

const MOCK_NOTIFS = [
    { id: "1", title: "Market Alert 🚀", body: "Bitcoin just hit a new high today!", time: "2h ago" },
    { id: "2", title: "Security Update", body: "Your password was changed successfully.", time: "1d ago" },
];

export default function NotificationsScreen() {
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Stack.Screen options={{ title: "Notifications", headerShown: true, headerTintColor: theme.textColor, headerStyle: { backgroundColor: theme.backgroundColor } }} />

            <FlatList
                data={MOCK_NOTIFS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={[styles.notifCard, { backgroundColor: theme.cardColor }]}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="notifications" size={20} color="#007AFF" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={[styles.notifTitle, { color: theme.textColor }]}>{item.title}</Text>
                            <Text style={styles.notifBody}>{item.body}</Text>
                            <Text style={styles.notifTime}>{item.time}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={{ textAlign: "center", color: "#888", marginTop: 50 }}>No new notifications</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    notifCard: { flexDirection: "row", padding: 15, borderRadius: 18, marginBottom: 12, alignItems: "center" },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,122,255,0.1)", justifyContent: "center", alignItems: "center" },
    notifTitle: { fontSize: 16, fontWeight: "bold" },
    notifBody: { fontSize: 14, color: "#888", marginTop: 2 },
    notifTime: { fontSize: 12, color: "#bbb", marginTop: 5 },
});