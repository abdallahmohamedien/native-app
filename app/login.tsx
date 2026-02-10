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

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../src/context/ThemeContext";

export default function LoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const auth = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: "#007AFF" }]}>
            <Ionicons name="flash" size={50} color="#fff" />
          </View>
          <Text style={[styles.title, { color: theme.textColor }]}>CryptoPulse</Text>
          <Text style={styles.subtitle}>Welcome back! Please login</Text>
        </View>

        {/* Form Section */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textColor }]}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.cardColor, color: theme.textColor },
              auth.errors.email ? styles.inputError : null,
            ]}
            placeholder="example@mail.com"
            placeholderTextColor="#666"
            value={auth.email}
            onChangeText={(text) => { auth.setEmail(text); auth.setErrors({ ...auth.errors, email: "" }); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {auth.errors.email && <Text style={styles.errorText}>{auth.errors.email}</Text>}

          <Text style={[styles.label, { color: theme.textColor, marginTop: 20 }]}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.cardColor, color: theme.textColor, flex: 1 },
                auth.errors.password ? styles.inputError : null,
              ]}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry={!auth.isPasswordVisible}
              value={auth.password}
              onChangeText={(text) => { auth.setPassword(text); auth.setErrors({ ...auth.errors, password: "" }); }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                auth.setIsPasswordVisible(!auth.isPasswordVisible);
              }}
            >
              <Ionicons
                name={auth.isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {auth.errors.password && <Text style={styles.errorText}>{auth.errors.password}</Text>}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.loginBtn, auth.loading && { opacity: 0.7 }]}
          onPress={auth.handleLogin}
          disabled={auth.loading}
        >
          {auth.loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/signup");
          }}
        >
          <Text style={{ color: "#888", fontSize: 15 }}>
            New user? <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 25, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  iconCircle: {
    width: 90, height: 90, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: "#007AFF", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
  },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: "#888", fontSize: 17, marginTop: 5 },
  inputContainer: { marginBottom: 30 },
  label: { fontSize: 15, fontWeight: "700", marginBottom: 10, marginLeft: 5 },
  input: { height: 60, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, borderWidth: 1.5, borderColor: "transparent", fontWeight: '500' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
  eyeIcon: { position: 'absolute', right: 20 },
  inputError: { borderColor: "#ff4757" },
  errorText: { color: "#ff4757", fontSize: 13, marginTop: 5, marginLeft: 5, fontWeight: '600' },
  loginBtn: {
    backgroundColor: "#007AFF", height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center",
    shadowColor: "#007AFF", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8
  },
  loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  signupLink: { marginTop: 30, alignItems: "center", padding: 10 },
});