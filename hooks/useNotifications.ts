import { useCallback, useState } from "react";

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "security" | "market" | "system";
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Market Alert 🚀",
      body: "Bitcoin just hit a new high today!",
      time: "2h ago",
      type: "market",
    },
    {
      id: "2",
      title: "Security Update 🛡️",
      body: "Your password was changed successfully.",
      time: "1d ago",
      type: "security",
    },
    {
      id: "3",
      title: "Welcome to CryptoPulse",
      body: "Start tracking your assets securely.",
      time: "2d ago",
      type: "system",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
  }, []);

  return { notifications, loading, clearNotifications };
};
