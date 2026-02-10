import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export const useVaultAnimations = (biometricsActive: boolean) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const securityBar = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (biometricsActive) {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse1, {
              toValue: 1.4,
              duration: 1500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulse1, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ),
        Animated.loop(
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(pulse2, {
              toValue: 1.6,
              duration: 1500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulse2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ),
        Animated.timing(securityBar, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      pulse1.setValue(1);
      pulse2.setValue(1);
      Animated.timing(securityBar, {
        toValue: 0.4,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [biometricsActive, pulse1, pulse2, securityBar]);

  return { fadeAnim, pulse1, pulse2, securityBar };
};
