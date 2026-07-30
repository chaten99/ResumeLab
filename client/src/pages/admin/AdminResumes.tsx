import React, { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAdminResumes, useDeleteAdminResume } from "@/features/admin/hooks/useAdmin";

export const AdminResumes: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: resumesData, isLoading } = useAdminResumes({ page, limit: 10 });
  const deleteMutation = useDeleteAdminResume();

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await deleteMutation.mutateAsync(resumeId);
      toast.success("Resume deleted by admin");
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  const resumes = resumesData?.resumes || [];
  const pagination = resumesData?.pagination || {};

  return (
    <PageTransition className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="size-6 text-primary" /> Resumes Moderation
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Inspect uploaded resume documents across the platform and purge moderation violations.
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Resume Name</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {resumes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No resumes found in database.
                    </td>
                  </tr>
                ) : (
                  resumes.map((r: any) => (
                    <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{r.originalName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{r.userId?.email || "Unknown"}</td>
                      <td className="py-3 px-4">{r.targetRole || "N/A"}</td>
                      <td className="py-3 px-4 capitalize font-semibold">{r.status}</td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(r._id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs h-8"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminResumes;
