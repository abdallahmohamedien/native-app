/* cspell:ignore Haptics */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

interface LoginErrors {
  email?: string;
  password?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validate = () => {
    let isValid = true;
    let newErrors: LoginErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const savedData = await AsyncStorage.getItem("registeredUser");

      // Simulation of network delay
      setTimeout(async () => {
        if (savedData) {
          const user = JSON.parse(savedData);

          if (
            user.email.toLowerCase() === email.toLowerCase() &&
            user.password === password
          ) {
            await AsyncStorage.setItem("userToken", "active_session");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)");
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Login Failed", "Incorrect email or password");
            setLoading(false);
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("No Account Found", "Please sign up first.");
          setLoading(false);
        }
      }, 1200);
    } catch (error) {
      setLoading(false);
      console.error("Login hook error:", error); // كدة استخدمنا المتغير والتحذير هيختفي
      Alert.alert("Error", "Something went wrong during login");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    errors,
    setErrors,
    isPasswordVisible,
    setIsPasswordVisible,
    handleLogin,
  };
};
