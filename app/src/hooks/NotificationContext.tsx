import {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import supabase from "../utils/supabase.ts";
import { useAuth } from "./AuthContext.tsx";

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  user_id: string;
  link: string;
  type: string;
}

interface NotificationContextType {
  notifications: Notification[];
  hasNotifications: boolean;
  clearNotifications: () => void;
  setHasNotif: (value: boolean) => void;
  deleteNotification: (id: number) => Promise<void>;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    if (!auth.ucid) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching notifications:", errorData);
          throw new Error(errorData.message || "Unknown error");
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${auth.ucid}`,
        },
        (payload) => {
          console.log(payload.new);
          const newNotification = payload.new as Notification;
          setNotifications((prev: Notification[]) => [
            newNotification,
            ...prev,
          ]);
          setHasNotifications(true);
        },
      )
      .subscribe();

    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auth.ucid]);

  const clearNotifications = () => {
    setHasNotifications(false);
    setNotifications([]);
  };

  const setHasNotif = (value: boolean) => {
    setHasNotifications(value);
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete notification");
      }
      setNotifications((prev: Notification[]) =>
        prev.filter((notification: Notification) => notification.id !== id),
      );
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasNotifications,
        clearNotifications,
        setHasNotif,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotif = () => useContext(NotificationContext);
