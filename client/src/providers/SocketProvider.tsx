import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { RESUME_QUERY_KEYS } from "@/features/resumes/hooks/useResumes";

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: userResponse } = useCurrentUser();
  const user = userResponse?.user;

  useEffect(() => {
    if (!user?.id && !user?._id) return;
    const userId = user.id || user._id;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", userId);

    const handleAnalysisStarted = (data: { resumeId: string }) => {
      toast.info("Resume analysis started...");
      if (data.resumeId) {
        queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.detail(data.resumeId) });
      }
    };

    const handleAnalysisCompleted = (data: { resumeId: string; analysis?: any }) => {
      toast.success("Resume analysis completed!");
      if (data.resumeId) {
        if (data.analysis) {
          queryClient.setQueryData(RESUME_QUERY_KEYS.analysis(data.resumeId), {
            success: true,
            analysis: data.analysis,
          });
        } else {
          queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.analysis(data.resumeId) });
        }
        queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.detail(data.resumeId) });
        queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.lists() });
      }
    };

    const handleAnalysisFailed = (data: { resumeId: string; errorMessage?: string }) => {
      toast.error(data.errorMessage || "Resume analysis failed");
      if (data.resumeId) {
        queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.detail(data.resumeId) });
        queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEYS.analysis(data.resumeId) });
      }
    };

    socket.on("analysis:started", handleAnalysisStarted);
    socket.on("analysis:completed", handleAnalysisCompleted);
    socket.on("analysis:failed", handleAnalysisFailed);

    return () => {
      socket.off("analysis:started", handleAnalysisStarted);
      socket.off("analysis:completed", handleAnalysisCompleted);
      socket.off("analysis:failed", handleAnalysisFailed);
    };
  }, [user, queryClient]);

  return <>{children}</>;
};
