/* cspell:ignore anims */
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks & Context
import { useSecurityVault } from "../hooks/useSecurityVault";
import { useVaultAnimations } from "../hooks/useVaultAnimations";
import { useTheme } from "../src/context/ThemeContext";

export default function EditProfile() {
    const { theme } = useTheme();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const vault = useSecurityVault();
    const anims = useVaultAnimations(vault.biometricsActive);

    if (!anims) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                headerTitle: "Vault Security",
                headerTransparent: true,
                headerTintColor: theme.textColor,
            }} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={{ opacity: anims.fadeAnim }}>

                        <View style={styles.radarSection}>
                            <View style={styles.radarContainer}>
                                {vault.biometricsActive && (
                                    <>
                                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: anims.pulse1 }], opacity: anims.pulse1.interpolate({ inputRange: [1, 1.4], outputRange: [0.5, 0] }) }]} />
                                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: anims.pulse2 }], opacity: anims.pulse2.interpolate({ inputRange: [1, 1.6], outputRange: [0.3, 0] }) }]} />
                                    </>
                                )}
                                <View style={[styles.profileFrame, { borderColor: vault.biometricsActive ? '#007AFF' : '#333' }]}>
                                    <Image
                                        source={{ uri: `https://ui-avatars.com/api/?name=${vault.name || 'User'}&background=007AFF&color=fff&size=200` }}
                                        style={styles.mainAvatar}
                                    />
                                    {vault.biometricsActive && (
                                        <View style={styles.activeBadge}><Ionicons name="shield-checkmark" size={16} color="#fff" /></View>
                                    )}
                                </View>
                            </View>

                            <Text style={[styles.userName, { color: theme.textColor }]}>{vault.name || "Anonymous"}</Text>

                            <View style={styles.scoreContainer}>
                                <View style={styles.scoreHeader}>
                                    <Text style={styles.scoreTitle}>Security Strength</Text>
                                    <Text style={[styles.scoreVal, { color: vault.biometricsActive ? '#007AFF' : '#FF9500' }]}>{vault.biometricsActive ? 'Excellent' : 'Basic'}</Text>
                                </View>
                                <View style={styles.barBackground}>
                                    <Animated.View style={[styles.barFill, { width: anims.securityBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: vault.biometricsActive ? '#007AFF' : '#FF9500' }]} />
                                </View>
                            </View>
                        </View>

                        <View style={[styles.glassCard, { backgroundColor: theme.cardColor }]}>
                            <Text style={styles.innerLabel}>Identity Details</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-circle-outline" size={22} color="#007AFF" />
                                <TextInput style={[styles.field, { color: theme.textColor }]} value={vault.name} onChangeText={vault.setName} placeholder="Name" placeholderTextColor="#555" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-unread-outline" size={22} color="#007AFF" />
                                <TextInput style={[styles.field, { color: theme.textColor }]} value={vault.email} onChangeText={vault.setEmail} placeholder="Email" autoCapitalize="none" />
                            </View>
                            <View style={[styles.inputWrapper, { borderBottomWidth: 0 }]}>
                                <Ionicons name="lock-closed-outline" size={22} color="#007AFF" />
                                <TextInput style={[styles.field, { color: theme.textColor }]} value={vault.password} secureTextEntry={!showPassword} onChangeText={vault.setPassword} placeholder="Password" />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#888" /></TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.glassCard, { backgroundColor: theme.cardColor, paddingVertical: 12 }]}>
                            <View style={styles.switchBox}>
                                <View style={styles.switchLead}>
                                    <View style={[styles.iconCircle, { backgroundColor: vault.biometricsActive ? '#007AFF20' : '#8881' }]}><Ionicons name="finger-print" size={22} color={vault.biometricsActive ? '#007AFF' : '#888'} /></View>
                                    <View>
                                        <Text style={[styles.switchMainTxt, { color: theme.textColor }]}>Biometric Shield</Text>
                                        <Text style={styles.switchSubTxt}>Quantum encryption active</Text>
                                    </View>
                                </View>
                                <Switch value={vault.biometricsActive} onValueChange={vault.toggleBiometrics} trackColor={{ false: "#222", true: "#007AFF" }} />
                            </View>
                        </View>

                        <TouchableOpacity activeOpacity={0.85} style={styles.saveBtn} onPress={() => vault.syncWithVault(() => router.back())}>
                            {vault.loading ? <ActivityIndicator color="#fff" /> : <View style={styles.saveBtnContent}><Text style={styles.saveBtnTxt}>Sync with Vault</Text><Ionicons name="shield-half" size={20} color="#fff" /></View>}
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
    radarSection: { alignItems: 'center', marginBottom: 35 },
    radarContainer: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    pulseRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#007AFF' },
    profileFrame: { width: 110, height: 110, borderRadius: 40, borderWidth: 3, padding: 4, justifyContent: 'center', alignItems: 'center' },
    mainAvatar: { width: 95, height: 95, borderRadius: 32 },
    activeBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#007AFF', width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    userName: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    scoreContainer: { width: '80%', marginTop: 20 },
    scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    scoreTitle: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
    scoreVal: { fontSize: 11, fontWeight: '900' },
    barBackground: { height: 6, backgroundColor: '#8882', borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },
    glassCard: { borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#8881' },
    innerLabel: { fontSize: 13, fontWeight: '800', color: '#007AFF', marginBottom: 15, textTransform: 'uppercase' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#8881' },
    field: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600' },
    switchBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    switchLead: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    switchMainTxt: { fontSize: 16, fontWeight: '700' },
    switchSubTxt: { fontSize: 12, color: '#888', marginTop: 2 },
    saveBtn: { backgroundColor: '#007AFF', height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    saveBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
    footprint: { textAlign: 'center', color: '#555', fontSize: 10, fontWeight: '700', marginTop: 25, textTransform: 'uppercase' }
});