/* cspell:ignore Haptics */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  [key: string]: string | undefined;
}

export const useSignup = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const passwordStrength = useMemo(() => {
    const pass = form.password;
    if (!pass) return { score: 0, label: "", color: "transparent" };
    if (pass.length < 6)
      return { score: 1, label: "Weak ❌", color: "#ff4757" };
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
    if (!validate()) return;

    setLoading(true);
    try {
      // Simulation of network delay
      setTimeout(async () => {
        const { confirm, ...userData } = form; // هنا confirm مستبعد عمداً من الحفظ
        await AsyncStorage.setItem("registeredUser", JSON.stringify(userData));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setLoading(false);

        Alert.alert("Success 🎉", "Welcome! Your account is ready.", [
          { text: "Go to Login", onPress: () => router.replace("/login") },
        ]);
      }, 1500);
    } catch (error) {
      console.error("Signup storage error:", error); // حل التحذير باستخدام المتغير
      setLoading(false);
      Alert.alert("Error", "Something went wrong saving your data.");
    }
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    loading,
    isPasswordVisible,
    setIsPasswordVisible,
    passwordStrength,
    handleSignup,
  };
};
