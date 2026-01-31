import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    </div>
  );
}
