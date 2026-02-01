import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";


interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  [key: string]: string | undefined;
}

export default function SignupScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});


  const passwordStrength = useMemo(() => {
    const pass = form.password;
    if (!pass) return { score: 0, label: "", color: "transparent" };
    if (pass.length < 6) return { score: 1, label: "Weak ❌", color: "#ff4757" };
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/) && pass.length >= 8)
      return { score: 3, label: "Strong 💪", color: "#2ed573" };
    return { score: 2, label: "Medium ⚠️", color: "#ffa502" };
  }, [form.password]);

  const validate = () => {
    let newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.includes("@")) newErrors.email = "Invalid email address";
    if (form.password.length < 6) newErrors.password = "Password too short";

    if (form.password !== form.confirm) {
      newErrors.confirm = "Passwords do not match";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validate()) {
      setLoading(true);
      try {

        setTimeout(async () => {
          await AsyncStorage.setItem("registeredUser", JSON.stringify(form));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLoading(false);
          Alert.alert("Success 🎉", "Welcome to CryptoPulse! Your account is ready.", [
            { text: "Go to Login", onPress: () => router.replace("/login") }
          ]);
        }, 1500);
      } catch {

        setLoading(false);
        Alert.alert("Error", "Something went wrong saving your data.");
      }
    }
  };

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

          {['name', 'email'].map((field) => (
            <View key={field} style={styles.fieldGap}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor }]}
                placeholder={field === 'name' ? "Full Name" : "Email Address"}
                placeholderTextColor="#666"
                autoCapitalize={field === 'email' ? "none" : "words"}
                onChangeText={(t) => {
                  setForm({ ...form, [field]: t });
                  setErrors({ ...errors, [field]: "" });
                }}
              />
              {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
            </View>
          ))}


          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.cardColor, color: theme.textColor, flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry={!isPasswordVisible}
              onChangeText={(t) => {
                setForm({ ...form, password: t });
                setErrors({ ...errors, password: "" });
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsPasswordVisible(!isPasswordVisible);
              }}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>


          {form.password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={[styles.strengthBarBackground, { backgroundColor: theme.cardColor }]}>
                <View style={[styles.strengthBarActive, {
                  width: `${(passwordStrength.score / 3) * 100}%`,
                  backgroundColor: passwordStrength.color
                }]} />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
            </View>
          )}


          <View style={[styles.passwordWrapper, { marginTop: 15 }]}>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.cardColor,
                color: theme.textColor,
                flex: 1,
                borderWidth: form.confirm && form.password !== form.confirm ? 1 : 0,
                borderColor: '#ff4757'
              }]}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry={!isPasswordVisible}
              onChangeText={(t) => {
                setForm({ ...form, confirm: t });
                setErrors({ ...errors, confirm: "" });
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsPasswordVisible(!isPasswordVisible);
              }}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
        </View>


        <TouchableOpacity
          style={[styles.btn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 25, justifyContent: "center" },
  backBtn: { position: "absolute", top: 40, left: 15, padding: 10, zIndex: 10 },
  header: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: "#888", fontSize: 17, marginTop: 5 },
  inputContainer: { marginBottom: 30 },
  fieldGap: { marginBottom: 15 },
  input: { height: 60, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '500' },
  passwordWrapper: { flexDirection: "row", alignItems: "center", width: '100%' },
  eyeIcon: { position: "absolute", right: 20, padding: 5 },
  strengthContainer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strengthBarBackground: { height: 6, flex: 1, borderRadius: 3, marginRight: 10, overflow: 'hidden' },
  strengthBarActive: { height: '100%', borderRadius: 3 },
  strengthText: { fontSize: 12, fontWeight: '800', width: 80, textAlign: 'right' },
  errorText: { color: "#ff4757", fontSize: 13, marginTop: 5, fontWeight: '600', marginLeft: 5 },
  btn: {
    backgroundColor: "#007AFF",
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 10
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});