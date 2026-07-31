import React, { createContext, useContext, useEffect, useState } from "react";
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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { data: userResponse } = useCurrentUser();
  const user = userResponse?.user;

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      if (user?.id) {
        socketInstance.emit("join", user.id);
        if (user.role === "admin") {
          socketInstance.emit("joinAdmin");
        }
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("credits:updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", "status"] });

      if (data.change && data.change > 0) {
        toast.success(`+${data.change} Credits Added!`, {
          description: data.reason || `New balance: ${data.credits} credits`,
        });
      }
    });

    socketInstance.on("subscription:updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", "status"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "history"] });

      toast.success("Subscription Updated!", {
        description: `Your active plan is now ${data.plan}.`,
      });
    });

    socketInstance.on("user:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    });

    socketInstance.on("notification:created", (data) => {
      if (data.type === "success") {
        toast.success(data.title, { description: data.message });
      } else if (data.type === "error") {
        toast.error(data.title, { description: data.message });
      } else {
        toast.info(data.title, { description: data.message });
      }
    });

    socketInstance.on("analysis:started", () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.info("AI Analysis Started", { description: "Processing resume metrics..." });
    });

    socketInstance.on("analysis:completed", () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("AI Analysis Completed!", { description: "Detailed diagnostics ready." });
    });

    socketInstance.on("analysis:failed", (data) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.error("AI Analysis Failed", { description: data.errorMessage || "Credits refunded." });
    });

    socketInstance.on("admin:telemetry", () => {
      if (user?.role === "admin") {
        queryClient.invalidateQueries({ queryKey: ["admin"] });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("credits:updated");
      socketInstance.off("subscription:updated");
      socketInstance.off("user:updated");
      socketInstance.off("notification:created");
      socketInstance.off("analysis:started");
      socketInstance.off("analysis:completed");
      socketInstance.off("analysis:failed");
      socketInstance.off("admin:telemetry");
      socketInstance.disconnect();
    };
  }, [user?.id, user?.role, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
