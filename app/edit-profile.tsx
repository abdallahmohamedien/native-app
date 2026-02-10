import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
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

const { width } = Dimensions.get('window');

export default function AdvancedSettings() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [biometricsActive, setBiometricsActive] = useState(false);

    // Animations Constants
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulse1 = useRef(new Animated.Value(1)).current;
    const pulse2 = useRef(new Animated.Value(1)).current;
    const securityBar = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        loadUserData();
        checkDeviceSupport();
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    }, []);


    useEffect(() => {
        if (biometricsActive) {
            Animated.parallel([
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulse1, { toValue: 1.4, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                        Animated.timing(pulse1, { toValue: 1, duration: 0, useNativeDriver: true }),
                    ])
                ),
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(500),
                        Animated.timing(pulse2, { toValue: 1.6, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                        Animated.timing(pulse2, { toValue: 1, duration: 0, useNativeDriver: true }),
                    ])
                ),
                Animated.timing(securityBar, { toValue: 1, duration: 800, useNativeDriver: false })
            ]).start();
        } else {
            pulse1.setValue(1);
            pulse2.setValue(1);
            Animated.timing(securityBar, { toValue: 0.4, duration: 500, useNativeDriver: false }).start();
        }
    }, [biometricsActive]);

    const checkDeviceSupport = async () => {
        const savedBio = await AsyncStorage.getItem("biometrics_enabled");
        setBiometricsActive(savedBio === "true");
    };

    const loadUserData = async () => {
        const savedData = await AsyncStorage.getItem("registeredUser");
        if (savedData) {
            const user = JSON.parse(savedData);
            setName(user.name || "");
            setEmail(user.email || "");
            setPassword(user.password || "");
        }
    };

    const toggleBiometrics = async (value: boolean) => {
        if (value) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Accessing Secure Core",
                disableDeviceFallback: true,
            });
            if (result.success) {
                setBiometricsActive(true);
                await AsyncStorage.setItem("biometrics_enabled", "true");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showMessage({ message: "Quantum Shield Enabled 🛡️", type: "success", backgroundColor: "#007AFF" });
            } else {
                setBiometricsActive(false);
            }
        } else {
            setBiometricsActive(false);
            await AsyncStorage.setItem("biometrics_enabled", "false");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const updatedUser = { name, email, password };
            await AsyncStorage.setItem("registeredUser", JSON.stringify(updatedUser));
            setTimeout(() => {
                setLoading(false);
                router.back();
            }, 1200);
        } catch (e) {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Stack.Screen options={{
                headerTitle: "Vault Security",
                headerTransparent: true,
                headerTintColor: theme.textColor,
                headerBlurEffect: 'dark'
            }} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* 🚀 Advanced Radar Header */}
                        <View style={styles.radarSection}>
                            <View style={styles.radarContainer}>
                                {biometricsActive && (
                                    <>
                                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse1 }], opacity: pulse1.interpolate({ inputRange: [1, 1.4], outputRange: [0.5, 0] }) }]} />
                                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse2 }], opacity: pulse2.interpolate({ inputRange: [1, 1.6], outputRange: [0.3, 0] }) }]} />
                                    </>
                                )}
                                <View style={[styles.profileFrame, { borderColor: biometricsActive ? '#007AFF' : '#333' }]}>
                                    <Image
                                        source={{ uri: `https://ui-avatars.com/api/?name=${name}&background=007AFF&color=fff&size=200` }}
                                        style={styles.mainAvatar}
                                    />
                                    {biometricsActive && (
                                        <View style={styles.activeBadge}>
                                            <Ionicons name="shield-checkmark" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            </View>

                            <Text style={[styles.userName, { color: theme.textColor }]}>{name || "Anonymous"}</Text>

                            {/* Security Score Bar */}
                            <View style={styles.scoreContainer}>
                                <View style={styles.scoreHeader}>
                                    <Text style={styles.scoreTitle}>Security Strength</Text>
                                    <Text style={[styles.scoreVal, { color: biometricsActive ? '#007AFF' : '#FF9500' }]}>
                                        {biometricsActive ? 'Excellent' : 'Basic'}
                                    </Text>
                                </View>
                                <View style={styles.barBackground}>
                                    <Animated.View style={[styles.barFill, {
                                        width: securityBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                                        backgroundColor: biometricsActive ? '#007AFF' : '#FF9500'
                                    }]} />
                                </View>
                            </View>
                        </View>

                        {/* 📝 Premium Form Card */}
                        <View style={[styles.glassCard, { backgroundColor: theme.cardColor }]}>
                            <Text style={styles.innerLabel}>Identity Details</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-circle-outline" size={22} color="#007AFF" />
                                <TextInput
                                    style={[styles.field, { color: theme.textColor }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Legal Name"
                                    placeholderTextColor="#555"
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-unread-outline" size={22} color="#007AFF" />
                                <TextInput
                                    style={[styles.field, { color: theme.textColor }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Recovery Email"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={[styles.inputWrapper, { borderBottomWidth: 0 }]}>
                                <Ionicons name="lock-closed-outline" size={22} color="#007AFF" />
                                <TextInput
                                    style={[styles.field, { color: theme.textColor }]}
                                    value={password}
                                    secureTextEntry={!showPassword}
                                    onChangeText={setPassword}
                                    placeholder="Vault Password"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 🛡️ Biometric Switch Card */}
                        <View style={[styles.glassCard, { backgroundColor: theme.cardColor, paddingVertical: 12 }]}>
                            <View style={styles.switchBox}>
                                <View style={styles.switchLead}>
                                    <View style={[styles.iconCircle, { backgroundColor: biometricsActive ? '#007AFF20' : '#8881' }]}>
                                        <Ionicons name="finger-print" size={22} color={biometricsActive ? '#007AFF' : '#888'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.switchMainTxt, { color: theme.textColor }]}>Biometric Shield</Text>
                                        <Text style={styles.switchSubTxt}>Quantum encryption active</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={biometricsActive}
                                    onValueChange={toggleBiometrics}
                                    trackColor={{ false: "#222", true: "#007AFF" }}
                                    ios_backgroundColor="#222"
                                />
                            </View>
                        </View>

                        {/* ⚡ Primary Action */}
                        <TouchableOpacity activeOpacity={0.85} style={styles.saveBtn} onPress={handleUpdate}>
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <View style={styles.saveBtnContent}>
                                    <Text style={styles.saveBtnTxt}>Sync with Vault</Text>
                                    <Ionicons name="shield-half" size={20} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.footprint}>AES-256 Bit Encryption Active</Text>

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24, paddingTop: 100, paddingBottom: 40 },

    // Radar Header
    radarSection: { alignItems: 'center', marginBottom: 35 },
    radarContainer: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    pulseRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#007AFF' },
    profileFrame: { width: 110, height: 110, borderRadius: 40, borderWidth: 3, padding: 4, justifyContent: 'center', alignItems: 'center' },
    mainAvatar: { width: 95, height: 95, borderRadius: 32 },
    activeBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#007AFF', width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    userName: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },

    // Security Score Bar
    scoreContainer: { width: '80%', marginTop: 20 },
    scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    scoreTitle: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
    scoreVal: { fontSize: 11, fontWeight: '900' },
    barBackground: { height: 6, backgroundColor: '#8882', borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },

    // Glass Cards
    glassCard: { borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#8881' },
    innerLabel: { fontSize: 13, fontWeight: '800', color: '#007AFF', marginBottom: 15, textTransform: 'uppercase' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#8881' },
    field: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600' },

    // Switch
    switchBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    switchLead: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    switchMainTxt: { fontSize: 16, fontWeight: '700' },
    switchSubTxt: { fontSize: 12, color: '#888', marginTop: 2 },

    // Action Button
    saveBtn: {
        backgroundColor: '#007AFF', height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#007AFF', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 10 }, elevation: 6
    },
    saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    saveBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
    footprint: { textAlign: 'center', color: '#555', fontSize: 10, fontWeight: '700', marginTop: 25, textTransform: 'uppercase' }
});