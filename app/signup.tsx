/* cspell:ignore Haptics */
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSignup } from "../hooks/useSignup";
import { useTheme } from "../src/context/ThemeContext";

export default function SignupScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const auth = useSignup();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={theme.textColor} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textColor }]}>Create Account</Text>
          <Text style={styles.subtitle}>Start your advanced crypto journey</Text>
        </View>

        <View style={styles.inputContainer}>
          {/* Name & Email Fields */}
          {['name', 'email'].map((field) => (
            <View key={field} style={styles.fieldGap}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor }]}
                placeholder={field === 'name' ? "Full Name" : "Email Address"}
                placeholderTextColor="#666"
                autoCapitalize={field === 'email' ? "none" : "words"}
                value={(auth.form as any)[field]}
                onChangeText={(t) => {
                  auth.setForm({ ...auth.form, [field]: t });
                  auth.setErrors({ ...auth.errors, [field]: "" });
                }}
              />
              {auth.errors[field] && <Text style={styles.errorText}>{auth.errors[field]}</Text>}
            </View>
          ))}

          {/* Password Field */}
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor, flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry={!auth.isPasswordVisible}
              value={auth.form.password}
              onChangeText={(t) => {
                auth.setForm({ ...auth.form, password: t });
                auth.setErrors({ ...auth.errors, password: "" });
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                auth.setIsPasswordVisible(!auth.isPasswordVisible);
              }}
            >
              <Ionicons name={auth.isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={22} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Strength Meter */}
          {auth.form.password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={[styles.strengthBarBackground, { backgroundColor: theme.cardColor }]}>
                <View style={[styles.strengthBarActive, {
                  width: `${(auth.passwordStrength.score / 3) * 100}%`,
                  backgroundColor: auth.passwordStrength.color
                }]} />
              </View>
              <Text style={[styles.strengthText, { color: auth.passwordStrength.color }]}>{auth.passwordStrength.label}</Text>
            </View>
          )}

          {/* Confirm Password */}
          <View style={[styles.passwordWrapper, { marginTop: 15 }]}>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.cardColor,
                color: theme.textColor,
                flex: 1,
                borderWidth: auth.form.confirm && auth.form.password !== auth.form.confirm ? 1 : 0,
                borderColor: '#ff4757'
              }]}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry={!auth.isPasswordVisible}
              value={auth.form.confirm}
              onChangeText={(t) => {
                auth.setForm({ ...auth.form, confirm: t });
                auth.setErrors({ ...auth.errors, confirm: "" });
              }}
            />
          </View>
          {auth.errors.confirm && <Text style={styles.errorText}>{auth.errors.confirm}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.btn, { opacity: auth.loading ? 0.7 : 1 }]}
          onPress={auth.handleSignup}
          disabled={auth.loading}
        >
          {auth.loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 25, justifyContent: "center" },
  backBtn: { position: "absolute", top: 20, left: 15, padding: 10, zIndex: 10 },
  header: { marginBottom: 30 },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: "#888", fontSize: 17, marginTop: 5 },
  inputContainer: { marginBottom: 30 },
  fieldGap: { marginBottom: 15 },
  input: { height: 62, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '500' },
  passwordWrapper: { flexDirection: "row", alignItems: "center", width: '100%' },
  eyeIcon: { position: "absolute", right: 20, padding: 5 },
  strengthContainer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strengthBarBackground: { height: 6, flex: 1, borderRadius: 3, marginRight: 10, overflow: 'hidden' },
  strengthBarActive: { height: '100%', borderRadius: 3 },
  strengthText: { fontSize: 12, fontWeight: '800', width: 80, textAlign: 'right' },
  errorText: { color: "#ff4757", fontSize: 13, marginTop: 5, fontWeight: '600', marginLeft: 5 },
  btn: {
    backgroundColor: "#007AFF", height: 62, borderRadius: 18, justifyContent: "center", alignItems: "center",
    shadowColor: "#007AFF", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginTop: 10
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});