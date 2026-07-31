import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({
  value: "",
  onChange: () => {},
});

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [selected, setSelected] = React.useState(value || defaultValue || "");

  const currentValue = value !== undefined ? value : selected;

  const handleChange = (val: string) => {
    if (value === undefined) setSelected(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all outline-none cursor-pointer",
        isActive ? "bg-background text-foreground shadow-xs font-bold" : "hover:text-foreground opacity-70",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;

  return <div className={cn("outline-none", className)}>{children}</div>;
}
