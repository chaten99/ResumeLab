import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Trash2, Eye, Plus, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { useResumes, useDeleteResume } from "@/features/resumes/hooks/useResumes";

export const ResumeHistory: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const { data: resumesResponse, isLoading } = useResumes();
  const deleteResumeMutation = useDeleteResume();

  const resumes = resumesResponse?.resumes || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteResumeMutation.mutateAsync(id);
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  const filteredResumes = resumes
    .filter(
      (r: any) =>
        r.originalName.toLowerCase().includes(search.toLowerCase()) ||
        (r.targetRole && r.targetRole.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6 font-sans">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-5xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="size-6 text-primary" /> Resume History &amp; Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search, manage, inspect details, and organize your uploaded resume documents.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/resumes/new")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
          <Plus className="size-4" /> Upload Resume
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border rounded-xl p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or target role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAsc(!sortAsc)}
          className="text-xs h-9 gap-1.5 w-full sm:w-auto"
        >
          <ArrowUpDown className="size-3.5" /> Sort: {sortAsc ? "Oldest First" : "Newest First"}
        </Button>
      </div>

      {/* Resumes Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {filteredResumes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="size-12 text-muted-foreground/30 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No Resumes Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {search ? "No resumes matched your search query." : "You have not uploaded any resumes yet."}
              </p>
            </div>
            {!search && (
              <Button size="sm" onClick={() => navigate("/resumes/new")} className="text-xs font-semibold h-8 gap-1">
                <Plus className="size-3.5" /> Upload Your First Resume
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Page Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredResumes.map((r: any) => (
                  <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{r.originalName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.targetRole || "General"}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{r.pageCount || 1} pg</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] capitalize font-bold">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/resumes/${r._id}`)}
                          className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10"
                        >
                          <Eye className="size-3.5" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(r._id, r.originalName)}
                          disabled={deleteResumeMutation.isPending}
                          className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ResumeHistory;
