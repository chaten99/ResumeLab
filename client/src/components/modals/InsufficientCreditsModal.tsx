import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
  currentCredits?: number;
}

export const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({
  isOpen,
  onClose,
  requiredCredits = 5,
  currentCredits = 0,
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate("/subscription");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader className="space-y-2 text-center sm:text-left">
          <div className="size-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 mb-1">
            <Zap className="size-5 fill-amber-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Insufficient Credits
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            You need <span className="font-bold text-foreground">{requiredCredits} credits</span> for this AI diagnostic tool, but you currently have <span className="font-bold text-amber-500">{currentCredits} credits</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 rounded-lg p-4 text-xs space-y-2 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your Balance</span>
            <span className="font-extrabold text-foreground">{currentCredits} Credits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Required</span>
            <span className="font-extrabold text-primary">{requiredCredits} Credits</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold h-9">
            Cancel
          </Button>
          <Button size="sm" onClick={handleUpgrade} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
            <Sparkles className="size-4" /> Upgrade Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientCreditsModal;
