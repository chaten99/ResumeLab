import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  subtitle?: string;
}

export function ThreeDotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 p-2", className)}>
      <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <div className="size-2 rounded-full bg-primary animate-bounce" />
    </div>
  );
}

export function LoaderOne({ className }: { className?: string }) {
  return <ThreeDotsLoader className={className} />;
}

export function FullPageLoader({ className }: LoaderProps) {
  return (
    <div className={cn("flex min-h-[70vh] w-full items-center justify-center p-6 animate-in fade-in duration-300", className)}>
      <ThreeDotsLoader />
    </div>
  );
}

export function LoaderOneDemo() {
  return <FullPageLoader />;
}
