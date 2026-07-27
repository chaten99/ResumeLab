import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "At least 1 uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least 1 special character (!@#$%^&*)",
      met: /[^a-zA-Z0-9]/.test(password),
    },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1 mt-2 pt-1 border-t border-border/40">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        Password requirements:
      </p>
      <div className="grid gap-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="size-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="size-3.5 text-destructive shrink-0" />
            )}
            <span
              className={
                req.met
                  ? "text-emerald-600 font-medium dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
