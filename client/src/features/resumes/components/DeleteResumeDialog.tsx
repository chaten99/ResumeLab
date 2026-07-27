import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteResume } from "@/features/resumes/hooks/useResumes";

interface DeleteResumeDialogProps {
  resume: {
    id: string;
    originalName: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteResumeDialog({
  resume,
  open,
  onOpenChange,
  onSuccess,
}: DeleteResumeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = useDeleteResume();

  if (!resume) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(resume.id);
      toast.success("Resume deleted");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md p-6">
        <AlertDialogHeader className="space-y-3 text-left">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            <Trash2 className="size-5" />
          </div>

          <div className="space-y-1">
            <AlertDialogTitle className="text-base font-semibold tracking-tight text-foreground">
              Delete resume?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
              “{resume.originalName}” will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex-row justify-end gap-2.5">
          <AlertDialogCancel
            disabled={isDeleting}
            variant="outline"
            className="h-8 px-3 text-xs"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
            className="h-8 px-3 text-xs gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Delete resume</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}