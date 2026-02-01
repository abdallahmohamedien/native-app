import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication'; // مكتبة البصمة
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { useTheme } from "../src/context/ThemeContext";

export default function AdvancedSettings() {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const router = useRouter();

    // States
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notifsEnabled, setNotifsEnabled] = useState(true);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [biometricsActive, setBiometricsActive] = useState(false);

    useEffect(() => {
        loadUserData();
        checkDeviceSupport();
    }, []);

    // التحقق من دعم الجهاز للبصمة
    const checkDeviceSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);

        // جلب حالة تفعيل البصمة من التخزين
        const savedBio = await AsyncStorage.getItem("biometrics_enabled");
        setBiometricsActive(savedBio === "true");
    };

    const loadUserData = async () => {
        const savedData = await AsyncStorage.getItem("registeredUser");
        if (savedData) {
            const user = JSON.parse(savedData);
            setName(user.name);
            setEmail(user.email);
        }
    };

    // دالة تفعيل/إلغاء البصمة مع التحقق
    const toggleBiometrics = async (value: boolean) => {
        if (value) {
            // طلب التحقق من الهوية قبل التفعيل
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authenticate to enable Biometrics",
                fallbackLabel: "Use Passcode",
            });

            if (result.success) {
                setBiometricsActive(true);
                await AsyncStorage.setItem("biometrics_enabled", "true");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showMessage({ message: "Biometrics Enabled", type: "success" });
            } else {
                setBiometricsActive(false);
            }
        } else {
            setBiometricsActive(false);
            await AsyncStorage.setItem("biometrics_enabled", "false");
        }
    };

    const handleSaveAll = async () => {
        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const updatedUser = { name, email };
            await AsyncStorage.setItem("registeredUser", JSON.stringify(updatedUser));
            await new Promise(resolve => setTimeout(resolve, 800));
            showMessage({ message: "Settings saved successfully", type: "success" });
            router.back();
        } catch (e) {
            showMessage({ message: "Error saving settings", type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const SettingRow = ({ label, children, icon, subLabel }: any) => (
        <View style={[styles.row, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.rowLabelGroup}>
                <View style={[styles.iconBox, { backgroundColor: isDarkMode ? "#222" : "#f0f0f0" }]}>
                    <Ionicons name={icon} size={18} color={theme.textColor} />
                </View>
                <View>
                    <Text style={[styles.label, { color: theme.textColor }]}>{label}</Text>
                    {subLabel && <Text style={styles.subLabelText}>{subLabel}</Text>}
                </View>
            </View>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Stack.Screen options={{ title: "Account Settings", headerShown: true, headerTintColor: theme.textColor, headerStyle: { backgroundColor: theme.backgroundColor } }} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.sectionTitle}>Identity</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
                        <SettingRow label="Display Name" icon="person">
                            <TextInput
                                style={[styles.input, { color: theme.textColor }]}
                                value={name}
                                onChangeText={setName}
                            />
                        </SettingRow>
                        <SettingRow label="Email" icon="mail" subLabel="Connected Account">
                            <Text style={{ color: "#888", fontSize: 14 }}>{email}</Text>
                        </SettingRow>
                    </View>

                    <Text style={styles.sectionTitle}>Security & Privacy</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
                        {isBiometricSupported && (
                            <SettingRow label="FaceID / Fingerprint" icon="finger-print" subLabel="Secure your wallet">
                                <Switch
                                    value={biometricsActive}
                                    onValueChange={toggleBiometrics}
                                    trackColor={{ false: "#767577", true: "#007AFF" }}
                                />
                            </SettingRow>
                        )}
                        <SettingRow label="Two-Factor Auth" icon="shield-half" subLabel="Add extra layer">
                            <TouchableOpacity onPress={() => showMessage({ message: "Coming in v1.1", type: "info" })}>
                                <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Setup</Text>
                            </TouchableOpacity>
                        </SettingRow>
                    </View>

                    <Text style={styles.sectionTitle}>App Preferences</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardColor }]}>
                        <SettingRow label="Dark Mode" icon="moon">
                            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: "#767577", true: "#007AFF" }} />
                        </SettingRow>
                        <SettingRow label="Price Alerts" icon="notifications">
                            <Switch value={notifsEnabled} onValueChange={setNotifsEnabled} trackColor={{ false: "#767577", true: "#007AFF" }} />
                        </SettingRow>
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Account</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert("Sign Out", "Are you sure?", [{ text: "Cancel" }, { text: "Logout", style: "destructive", onPress: () => router.replace("/login") }])}>
                        <Text style={styles.dangerBtnText}>Logout Account</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 13, fontWeight: "800", color: "#888", marginBottom: 10, marginTop: 20, textTransform: "uppercase", marginLeft: 10, letterSpacing: 0.5 },
    card: { borderRadius: 24, overflow: "hidden", marginBottom: 15 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 0.5 },
    rowLabelGroup: { flexDirection: "row", alignItems: "center" },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    label: { fontSize: 16, fontWeight: "600" },
    subLabelText: { fontSize: 12, color: "#888", marginTop: 2 },
    input: { flex: 1, textAlign: "right", fontSize: 16, fontWeight: "500" },
    saveBtn: { backgroundColor: "#007AFF", height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", marginTop: 30, shadowColor: "#007AFF", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    dangerBtn: { marginTop: 20, height: 55, justifyContent: "center", alignItems: "center" },
    dangerBtnText: { color: "#ff4757", fontSize: 15, fontWeight: "700" }
});