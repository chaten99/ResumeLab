import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

function getSocketBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return raw.replace(/\/api\/?$/, "") || "http://localhost:5000";
  }
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { data: userResponse } = useCurrentUser();
  const user = userResponse?.user;
  const userId = user?.id || user?._id;

  const qcRef = useRef(queryClient);
  qcRef.current = queryClient;

  const handleNewNotification = useCallback((data: { notification: any; unreadCount: number }) => {
    const newNotif = data.notification || data;
    const qc = qcRef.current;

    qc.setQueryData(["user", "notifications"], (oldData: any) => {
      if (!oldData) {
        return { success: true, notifications: [newNotif], unreadCount: data.unreadCount ?? 1 };
      }
      const exists = oldData.notifications?.some((n: any) => n._id === newNotif._id);
      if (exists) return oldData;
      return {
        ...oldData,
        notifications: [newNotif, ...(oldData.notifications || [])],
        unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : (oldData.unreadCount || 0) + 1,
      };
    });

    qc.invalidateQueries({ queryKey: ["user", "activities"] });

    if (newNotif.type === "success") {
      toast.success(newNotif.title, { description: newNotif.message });
    } else if (newNotif.type === "error") {
      toast.error(newNotif.title, { description: newNotif.message });
    } else if (newNotif.type === "warning") {
      toast.warning(newNotif.title, { description: newNotif.message });
    } else {
      toast.info(newNotif.title, { description: newNotif.message });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socketUrl = getSocketBaseUrl();

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      socketInstance.emit("join", userId.toString());
      if (user?.role === "admin") {
        socketInstance.emit("joinAdmin");
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socketInstance.on("credits:updated", (data) => {
      const qc = qcRef.current;
      qc.invalidateQueries({ queryKey: ["auth"] });
      qc.invalidateQueries({ queryKey: ["user", "credits"] });
      qc.invalidateQueries({ queryKey: ["subscription", "status"] });

      if (data.change && data.change > 0) {
        toast.success(`+${data.change} Credits Added!`, {
          description: data.reason || `New balance: ${data.credits} credits`,
        });
      }
    });

    socketInstance.on("subscription:updated", (data) => {
      const qc = qcRef.current;
      qc.invalidateQueries({ queryKey: ["auth"] });
      qc.invalidateQueries({ queryKey: ["subscription", "status"] });
      qc.invalidateQueries({ queryKey: ["billing", "history"] });

      toast.success("Subscription Updated!", {
        description: `Your active plan is now ${data.plan}.`,
      });
    });

    socketInstance.on("user:updated", () => {
      const qc = qcRef.current;
      qc.invalidateQueries({ queryKey: ["auth"] });
      qc.invalidateQueries({ queryKey: ["user", "profile"] });
    });

    socketInstance.on("notification:new", handleNewNotification);

    socketInstance.on("notification:updated", (data: { notificationId?: string; allRead?: boolean; unreadCount: number }) => {
      qcRef.current.setQueryData(["user", "notifications"], (oldData: any) => {
        if (!oldData) return oldData;
        if (data.allRead) {
          return {
            ...oldData,
            notifications: oldData.notifications?.map((n: any) => ({ ...n, read: true })),
            unreadCount: 0,
          };
        }
        return {
          ...oldData,
          notifications: oldData.notifications?.map((n: any) =>
            n._id === data.notificationId ? { ...n, read: true } : n
          ),
          unreadCount: data.unreadCount,
        };
      });
    });

    socketInstance.on("notification:deleted", (data: { notificationId: string; unreadCount: number }) => {
      qcRef.current.setQueryData(["user", "notifications"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications?.filter((n: any) => n._id !== data.notificationId),
          unreadCount: data.unreadCount,
        };
      });
    });

    socketInstance.on("activity:created", () => {
      qcRef.current.invalidateQueries({ queryKey: ["user", "activities"] });
    });

    socketInstance.on("resume:uploaded", () => {
      const qc = qcRef.current;
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["user", "activities"] });
    });

    socketInstance.on("resume:deleted", () => {
      const qc = qcRef.current;
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["user", "activities"] });
    });

    socketInstance.on("analysis:started", () => {
      qcRef.current.invalidateQueries({ queryKey: ["resumes"] });
      toast.info("AI Analysis Started", { description: "Processing resume metrics..." });
    });

    socketInstance.on("analysis:completed", () => {
      const qc = qcRef.current;
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["user", "activities"] });
    });

    socketInstance.on("analysis:failed", () => {
      qcRef.current.invalidateQueries({ queryKey: ["resumes"] });
    });

    socketInstance.on("admin:telemetry", () => {
      if (user?.role === "admin") {
        qcRef.current.invalidateQueries({ queryKey: ["admin"] });
      }
    });

    socketRef.current = socketInstance;

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId, user?.role]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
